import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { privateBlobStorage } from './lib/private-blob-storage'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { fr } from '@payloadcms/translations/languages/fr'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Jobs } from './collections/Jobs'
import { Applications } from './collections/Applications'
import { LogoMedia } from './collections/LogoMedia'
import { ClientLogos } from './globals/ClientLogos'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) } },
  i18n: { supportedLanguages: { fr }, fallbackLanguage: 'fr' },
  collections: [Users, Jobs, Applications, Media, LogoMedia],
  globals: [ClientLogos],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Dev: auto-push schema. Production: set PAYLOAD_PUSH=true once for the first deploy, or use migrations.
    push: process.env.NODE_ENV !== 'production' || process.env.PAYLOAD_PUSH === 'true',
  }),
  email: smtpConfigured
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || 'rh@globalcomm.ma',
        defaultFromName: 'Global Comm Recrutement',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  sharp,
  plugins: [
    privateBlobStorage({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: ['media', 'logo-media'],
    }),
  ],
})
