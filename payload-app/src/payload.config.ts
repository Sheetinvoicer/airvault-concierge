import { resendAdapter } from '@payloadcms/email-resend'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Flights } from './collections/Flights'
import { Claims } from './collections/Claims'
import { Rides } from './collections/Rides'
import { PetChecklists } from './collections/PetChecklists'
import { Meals } from './collections/Meals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Flights, Claims, Rides, PetChecklists, Meals],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? process.env.DATABASE_URL ?? '',
    },
    // Use process.cwd() so the path resolves to /app/migrations in Docker regardless
    // of where the compiled Next.js chunk lives (import.meta.url points deep inside .next/server/)
    migrationDir: process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), 'migrations')
      : path.resolve(dirname, '..', 'migrations'),
  }),
  sharp,
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',

  // Resend Email Adapter — uses env vars set in Render dashboard
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@sheetinvoicer.com',
    defaultFromName: 'AirVault Concierge',
  }),
})