import { resendAdapter } from '@payloadcms/email-resend'
import { postgresAdapter } from '@payloadcms/db-postgres'  // ✅ Changed from sqliteAdapter
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
  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({                    // ✅ Changed from sqliteAdapter
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',

  // Email adapter (keep as is)
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@sheetinvoicer.com',
    defaultFromName: 'AirVault Concierge',
  }),
})