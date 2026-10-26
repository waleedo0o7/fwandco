param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet('start', 'status', 'stop')]
  [string]$Action
)

$ErrorActionPreference = 'Stop'

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$localRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot '.local'))
$dataDirectory = [System.IO.Path]::GetFullPath((Join-Path $localRoot 'postgres-data'))
$logFile = Join-Path $localRoot 'postgres.log'
$workspaceRoot = Split-Path $repositoryRoot -Parent
$defaultBinDirectory = Join-Path $workspaceRoot '.local\postgresql-16.8\pgsql\bin'
$binDirectory = if ($env:POSTGRES_BIN_DIR) { $env:POSTGRES_BIN_DIR } else { $defaultBinDirectory }
$port = 55432

if (-not $dataDirectory.StartsWith($localRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Refusing to manage a PostgreSQL data directory outside the repository local-data folder.'
}

$pgControl = Join-Path $binDirectory 'pg_ctl.exe'
$pgIsReady = Join-Path $binDirectory 'pg_isready.exe'

if (-not (Test-Path -LiteralPath $pgControl) -or -not (Test-Path -LiteralPath $pgIsReady)) {
  throw "PostgreSQL 16.8 binaries were not found at: $binDirectory"
}

if (-not (Test-Path -LiteralPath (Join-Path $dataDirectory 'PG_VERSION'))) {
  throw "The local PostgreSQL cluster is not initialized at: $dataDirectory"
}

switch ($Action) {
  'start' {
    & $pgIsReady -h 127.0.0.1 -p $port *> $null
    if ($LASTEXITCODE -eq 0) {
      Write-Output "PostgreSQL is already accepting connections on 127.0.0.1:$port."
      exit 0
    }

    $serverOptions = "-p $port -h 127.0.0.1"
    & $pgControl -D $dataDirectory -l $logFile -o $serverOptions start
  }
  'status' {
    & $pgIsReady -h 127.0.0.1 -p $port
    exit $LASTEXITCODE
  }
  'stop' {
    & $pgControl -D $dataDirectory status *> $null
    if ($LASTEXITCODE -ne 0) {
      Write-Output 'PostgreSQL is already stopped.'
      exit 0
    }

    & $pgControl -D $dataDirectory -m fast stop
  }
}
