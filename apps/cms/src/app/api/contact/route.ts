import { getPayload } from 'payload'
import { z } from 'zod'

import configPromise from '../../../payload.config'
import { getServerEnvironment } from '../../../env'

const environment = getServerEnvironment()

const submissionSchema = z.object({
  email: z.email().max(254),
  message: z.string().trim().min(10).max(3000),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).optional().default(''),
  startedAt: z.number().int().positive(),
  website: z.string().max(200).optional().default(''),
})

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_STORE_MAX = 5_000
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const MINIMUM_FORM_TIME_MS = 2_000
const MAXIMUM_FORM_AGE_MS = 24 * 60 * 60 * 1000

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get('origin')
  const headers = new Headers({
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  })

  if (origin === environment.WEB_PUBLIC_URL) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  }

  return headers
}

const getClientKey = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return (
    forwardedFor?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

const isRateLimited = (key: string) => {
  const now = Date.now()
  const current = rateLimitStore.get(key)

  if (!current || current.resetAt <= now) {
    if (rateLimitStore.size >= RATE_LIMIT_STORE_MAX) {
      for (const [storedKey, entry] of rateLimitStore) {
        if (entry.resetAt <= now) {
          rateLimitStore.delete(storedKey)
        }
      }

      if (rateLimitStore.size >= RATE_LIMIT_STORE_MAX) {
        const oldestKey = rateLimitStore.keys().next().value
        if (oldestKey) rateLimitStore.delete(oldestKey)
      }
    }

    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  current.count += 1
  return current.count > RATE_LIMIT_MAX
}

export const OPTIONS = (request: Request) =>
  new Response(null, {
    headers: getCorsHeaders(request),
    status: 204,
  })

export const POST = async (request: Request) => {
  const headers = getCorsHeaders(request)
  const origin = request.headers.get('origin')

  if (origin && origin !== environment.WEB_PUBLIC_URL) {
    return Response.json(
      { error: 'Origin is not allowed.' },
      { headers, status: 403 },
    )
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json(
      { error: 'Too many submissions. Try again later.' },
      { headers, status: 429 },
    )
  }

  let input: unknown

  try {
    input = await request.json()
  } catch {
    return Response.json(
      { error: 'Invalid JSON body.' },
      { headers, status: 400 },
    )
  }

  const result = submissionSchema.safeParse(input)

  if (!result.success) {
    return Response.json(
      {
        error: 'Invalid submission.',
        fields: z.flattenError(result.error).fieldErrors,
      },
      { headers, status: 422 },
    )
  }

  const elapsed = Date.now() - result.data.startedAt
  const looksAutomated =
    result.data.website.length > 0 ||
    elapsed < MINIMUM_FORM_TIME_MS ||
    elapsed > MAXIMUM_FORM_AGE_MS

  if (looksAutomated) {
    return Response.json({ accepted: true }, { headers, status: 202 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'contact-submissions',
      data: {
        email: result.data.email,
        message: result.data.message,
        name: result.data.name,
        phone: result.data.phone || undefined,
        status: 'new',
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    return Response.json({ accepted: true }, { headers, status: 201 })
  } catch (error) {
    console.error('Contact submission failed.', error)
    return Response.json(
      { error: 'Submission could not be saved.' },
      { headers, status: 500 },
    )
  }
}
