// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm create-admin   (or create the first admin at /admin)
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) { console.error('Définissez ADMIN_EMAIL et ADMIN_PASSWORD.'); process.exit(1) }
const payload = await getPayload({ config })
await payload.create({ collection: 'users', data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
console.log('Administrateur créé :', ADMIN_EMAIL)
process.exit(0)
