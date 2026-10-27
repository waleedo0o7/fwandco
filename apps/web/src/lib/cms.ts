const cmsUrl = import.meta.env.PUBLIC_CMS_URL?.replace(/\/$/, '')

if (!cmsUrl) {
  throw new Error('PUBLIC_CMS_URL is required to build the Astro website.')
}

type Media = {
  alt: string
  id: number
  url?: null | string
}

type RichTextNode = {
  children?: RichTextNode[]
  text?: string
}

export type ManagedPage = {
  contactInformation?: {
    address?: null | string
    email?: null | string
    phone?: null | string
  }
  content: {
    root?: RichTextNode
  }
  heading: string
  image?: Media | number | null
  seo: {
    description: string
    image?: Media | number | null
    noIndex?: boolean | null
    title: string
  }
  slug: 'about' | 'contact'
  title: string
}

type PayloadList<T> = {
  docs: T[]
  totalDocs: number
}

export const getManagedPage = async (slug: ManagedPage['slug']) => {
  const query = new URLSearchParams({
    depth: '2',
    draft: 'false',
    limit: '1',
    'where[slug][equals]': slug,
  })
  const response = await fetch(`${cmsUrl}/api/pages?${query}`)

  if (!response.ok) {
    throw new Error(
      `Payload page request failed for "${slug}" with HTTP ${response.status}.`,
    )
  }

  const result = (await response.json()) as PayloadList<ManagedPage>
  const page = result.docs[0]

  if (!page) {
    throw new Error(`Published Payload page "${slug}" was not found.`)
  }

  return page
}

const collectText = (node: RichTextNode): string[] => {
  const ownText = typeof node.text === 'string' ? [node.text] : []
  const childText = node.children?.flatMap(collectText) ?? []
  return [...ownText, ...childText]
}

export const getRichTextSummary = (content: ManagedPage['content']) =>
  content.root ? collectText(content.root).join(' ').trim() : ''

export const getMedia = (media: ManagedPage['image']) => {
  if (!media || typeof media === 'number' || !media.url) {
    return null
  }

  return {
    alt: media.alt,
    url: new URL(media.url, `${cmsUrl}/`).toString(),
  }
}

export const publicCmsUrl = cmsUrl
