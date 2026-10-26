import { z } from 'zod'

const serverEnvironmentSchema = z.object({
  CMS_PUBLIC_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  PAYLOAD_SECRET: z.string().min(32),
  WEB_PUBLIC_URL: z.string().url(),
})

export const getServerEnvironment = () =>
  serverEnvironmentSchema.parse(process.env)
