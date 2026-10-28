$ErrorActionPreference = 'Stop'

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$artifactRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot '.artifacts'))
$releaseRoot = [System.IO.Path]::GetFullPath((Join-Path $artifactRoot 'cpanel-release'))
$stageRoot = [System.IO.Path]::GetFullPath((Join-Path $artifactRoot 'cpanel-stage'))
$standaloneRoot = Join-Path $projectRoot 'apps/cms/.next/standalone'
$standaloneApp = Join-Path $standaloneRoot 'apps/cms'
$webDist = Join-Path $projectRoot 'apps/web/dist'

function Assert-ArtifactPath([string]$Path) {
  $artifactPrefix = $artifactRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
  $fullPath = [System.IO.Path]::GetFullPath($Path)

  if (-not $fullPath.StartsWith($artifactPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to modify a path outside .artifacts: $fullPath"
  }
}

function Reset-ArtifactDirectory([string]$Path) {
  Assert-ArtifactPath $Path

  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Recurse -Force
  }

  New-Item -ItemType Directory -Path $Path -Force | Out-Null
}

function Invoke-Checked([string]$Label, [scriptblock]$Command) {
  Write-Host "==> $Label"
  & $Command

  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE."
  }
}

Set-Location $projectRoot

if ((& node --version) -ne 'v24.13.0') {
  throw 'Node.js 24.13.0 is required to prepare the cPanel release.'
}

if (Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue) {
  throw 'Port 3000 must be free; stop the local CMS before preparing the release.'
}

Invoke-Checked 'Lint, TypeScript, and formatting checks' {
  & corepack pnpm lint
  if ($LASTEXITCODE -eq 0) { & corepack pnpm typecheck }
  if ($LASTEXITCODE -eq 0) { & corepack pnpm format:check }
}
Invoke-Checked 'Full Payload/Next production build' {
  & corepack pnpm build:cms:full
}

Reset-ArtifactDirectory $releaseRoot
Reset-ArtifactDirectory $stageRoot

if (-not (Test-Path -LiteralPath $standaloneApp)) {
  throw 'Next.js standalone output was not generated.'
}

Copy-Item -LiteralPath (Join-Path $projectRoot 'apps/cms/.next/static') -Destination (Join-Path $standaloneApp '.next/static') -Recurse -Force
$sourceMedia = Join-Path $projectRoot 'apps/cms/media'
$standaloneMedia = Join-Path $standaloneApp 'media'
New-Item -ItemType Directory -Path $standaloneMedia -Force | Out-Null
if (Test-Path -LiteralPath $sourceMedia) {
  Copy-Item -Path (Join-Path $sourceMedia '*') -Destination $standaloneMedia -Recurse -Force
}

$sharpWinSource = Join-Path $projectRoot 'node_modules/.pnpm/@img+sharp-win32-x64@0.35.5/node_modules/@img/sharp-win32-x64/lib'
$sharpWinDestination = Join-Path $standaloneRoot 'node_modules/.pnpm/@img+sharp-win32-x64@0.35.5/node_modules/@img/sharp-win32-x64/lib'
Copy-Item -LiteralPath (Join-Path $sharpWinSource 'libvips-42.dll') -Destination $sharpWinDestination -Force
Copy-Item -LiteralPath (Join-Path $sharpWinSource 'libvips-cpp-8.18.7.dll') -Destination $sharpWinDestination -Force

$linuxSharp = Get-ChildItem $standaloneRoot -Recurse -File -Filter 'sharp-linux-x64-0.35.5.node' | Select-Object -First 1
$linuxVips = Get-ChildItem $standaloneRoot -Recurse -File -Filter 'libvips-cpp.so.8.18.7' | Select-Object -First 1

if (-not $linuxSharp -or -not $linuxVips) {
  throw 'The standalone output is missing the Linux x64 Sharp runtime.'
}

$cmsStdout = Join-Path $artifactRoot 'release-cms.stdout.log'
$cmsStderr = Join-Path $artifactRoot 'release-cms.stderr.log'
$nodeExecutable = (Get-Command node).Source
$cmsProcess = Start-Process -FilePath $nodeExecutable -ArgumentList 'server.js' -WorkingDirectory $standaloneApp -WindowStyle Hidden -RedirectStandardOutput $cmsStdout -RedirectStandardError $cmsStderr -PassThru

try {
  $cmsReady = $false
  for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
    if ($cmsProcess.HasExited) {
      break
    }

    try {
      Invoke-WebRequest -Uri 'http://localhost:3000/cms/api/pages?limit=1' -UseBasicParsing | Out-Null
      $cmsReady = $true
      break
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  if (-not $cmsReady) {
    throw "Temporary production CMS did not start. Review $cmsStderr."
  }

  Invoke-Checked 'Astro production build against the standalone CMS' {
    & corepack pnpm build:web
  }
} finally {
  if (-not $cmsProcess.HasExited) {
    Stop-Process -Id $cmsProcess.Id -Force
    $cmsProcess.WaitForExit()
  }
}

Invoke-Checked 'Production dependency audit' {
  & corepack pnpm audit --prod
}

$archivePaths = [System.Collections.Generic.List[string]]::new()
$archivePaths.Add('apps')
$virtualStore = Join-Path $standaloneRoot 'node_modules/.pnpm'

Get-ChildItem $virtualStore -Force |
  Where-Object { $_.Name -ne 'node_modules' } |
  ForEach-Object { $archivePaths.Add("node_modules/.pnpm/$($_.Name)") }

$linkFarm = Join-Path $virtualStore 'node_modules'
Get-ChildItem $linkFarm -Force | ForEach-Object {
  if ($_.Name.StartsWith('@')) {
    Get-ChildItem $_.FullName -Force |
      Where-Object { -not ($_.Parent.Name -eq '@esbuild' -and $_.Name -eq 'win32-x64') } |
      ForEach-Object {
        $archivePaths.Add("node_modules/.pnpm/node_modules/$($_.Parent.Name)/$($_.Name)")
      }
  } else {
    $archivePaths.Add("node_modules/.pnpm/node_modules/$($_.Name)")
  }
}

$archiveList = Join-Path $artifactRoot 'cpanel-archive-files.txt'
$baseArchive = Join-Path $artifactRoot 'cpanel-base.tar.gz'
$archivePaths | Set-Content -LiteralPath $archiveList -Encoding utf8

Invoke-Checked 'Create portable physical dependency stage' {
  & tar.exe -czf $baseArchive --exclude='apps/cms/.env' -C $standaloneRoot -T $archiveList
}
Invoke-Checked 'Extract portable dependency stage' {
  & tar.exe -xzf $baseArchive -C $stageRoot
}

$stageNodeModules = Join-Path $stageRoot 'node_modules'
Get-ChildItem $linkFarm -Force | ForEach-Object {
  if ($_.Name.StartsWith('@')) {
    $scopeDestination = Join-Path $stageNodeModules $_.Name
    New-Item -ItemType Directory -Path $scopeDestination -Force | Out-Null
    Get-ChildItem $_.FullName -Force |
      Where-Object { -not ($_.Parent.Name -eq '@esbuild' -and $_.Name -eq 'win32-x64') } |
      ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $scopeDestination $_.Name) -Recurse -Force
      }
  } else {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $stageNodeModules $_.Name) -Recurse -Force
  }
}

$semverSource = Join-Path $standaloneRoot 'node_modules/.pnpm/semver@7.8.5/node_modules/semver'
$semverDestination = Join-Path $stageNodeModules 'semver'
Copy-Item -Path (Join-Path $semverSource '*') -Destination $semverDestination -Recurse -Force

Set-Content -LiteralPath (Join-Path $stageRoot 'app.js') -Encoding utf8 -Value "require('./apps/cms/server.js')"
Copy-Item -LiteralPath (Join-Path $projectRoot 'apps/cms/.env.example') -Destination (Join-Path $stageRoot 'apps/cms/.env.example') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs/cpanel-deployment.md') -Destination (Join-Path $stageRoot 'DEPLOYMENT.md') -Force

$reparsePoints = Get-ChildItem $stageRoot -Recurse -Attributes ReparsePoint -Force -ErrorAction SilentlyContinue
if ($reparsePoints) {
  throw 'Portable stage still contains Windows reparse points.'
}

$cmsArchive = Join-Path $releaseRoot 'cms-linux-x64.tar.gz'
$webArchive = Join-Path $releaseRoot 'web-static.zip'
Invoke-Checked 'Create CMS Linux x64 archive' {
  & tar.exe -czf $cmsArchive -C $stageRoot .
}
Compress-Archive -Path (Join-Path $webDist '*') -DestinationPath $webArchive -CompressionLevel Optimal

$cmsEntries = & tar.exe -tf $cmsArchive
$requiredEntries = @(
  './app.js',
  './apps/cms/server.js',
  './apps/cms/.next/static/',
  './apps/cms/media/',
  './node_modules/semver/index.js'
)

foreach ($entry in $requiredEntries) {
  if (-not ($cmsEntries -like "*$entry*")) {
    throw "CMS archive is missing required entry: $entry"
  }
}

if ($cmsEntries -contains './apps/cms/.env') {
  throw 'CMS archive must not contain a real .env file.'
}

if (-not ($cmsEntries -like '*sharp-linux-x64-0.35.5.node*') -or -not ($cmsEntries -like '*libvips-cpp.so.8.18.7*')) {
  throw 'CMS archive is missing Linux Sharp binaries.'
}

$cmsHash = (Get-FileHash -LiteralPath $cmsArchive -Algorithm SHA256).Hash.ToLowerInvariant()
$webHash = (Get-FileHash -LiteralPath $webArchive -Algorithm SHA256).Hash.ToLowerInvariant()
@(
  "$cmsHash  cms-linux-x64.tar.gz",
  "$webHash  web-static.zip"
) | Set-Content -LiteralPath (Join-Path $releaseRoot 'SHA256SUMS.txt') -Encoding ascii

$manifest = [ordered]@{
  generatedAt = [DateTimeOffset]::UtcNow.ToString('o')
  node = '24.13.0'
  payload = '3.91.0'
  next = '16.4.3'
  astro = '7.4.2'
  postgresql = '16.8'
  cmsStartupFile = 'app.js'
  cmsSha256 = $cmsHash
  webSha256 = $webHash
}
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $releaseRoot 'release-manifest.json') -Encoding utf8
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs/cpanel-deployment.md') -Destination (Join-Path $releaseRoot 'DEPLOYMENT.md') -Force

Remove-Item -LiteralPath $stageRoot -Recurse -Force
Remove-Item -LiteralPath $baseArchive -Force
Remove-Item -LiteralPath $archiveList -Force

Write-Host "cPanel release created at $releaseRoot"
