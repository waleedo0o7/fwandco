import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Addresses } from './collections/Addresses'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Groups } from './collections/Groups'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { PhoneNumbers } from './collections/PhoneNumbers'
import { TaskAssignments } from './collections/TaskAssignments'
import { Tasks } from './collections/Tasks'
import { Users } from './collections/Users'
import { getServerEnvironment } from './env'
import { migrations } from './migrations'

const environment = getServerEnvironment()
const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    importMap: {
      baseDir: currentDirectory,
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Groups,
    People,
    PhoneNumbers,
    Addresses,
    Tasks,
    TaskAssignments,
    ContactSubmissions,
    Media,
    Pages,
  ],
  cors: [environment.WEB_PUBLIC_URL],
  csrf: [environment.CMS_PUBLIC_URL, environment.WEB_PUBLIC_URL],
  db: postgresAdapter({
    migrationDir: path.resolve(currentDirectory, 'migrations'),
    pool: {
      connectionString: environment.DATABASE_URL,
      max: 5,
    },
    prodMigrations: migrations,
    push: false,
  }),
  editor: lexicalEditor(),
  graphQL: {
    disable: true,
  },
  secret: environment.PAYLOAD_SECRET,
  serverURL: environment.CMS_PUBLIC_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(currentDirectory, 'payload-types.ts'),
  },
})
