import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { getServerEnvironment } from './env'

const environment = getServerEnvironment()

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(import.meta.dirname),
    },
    user: Users.slug,
  },
  collections: [Users, Media],
  cors: [environment.WEB_PUBLIC_URL],
  csrf: [environment.CMS_PUBLIC_URL, environment.WEB_PUBLIC_URL],
  db: postgresAdapter({
    pool: {
      connectionString: environment.DATABASE_URL,
      max: 5,
    },
  }),
  editor: lexicalEditor(),
  graphQL: {
    disable: true,
  },
  secret: environment.PAYLOAD_SECRET,
  serverURL: environment.CMS_PUBLIC_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(import.meta.dirname, 'payload-types.ts'),
  },
})
