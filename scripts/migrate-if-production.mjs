// Runs `payload migrate` ONLY for production builds.
// Why: DATABASE_URL is shared by Preview and Production scopes (Neon integration). A preview/branch build
// must never apply schema migrations to the production database.
import { spawnSync } from 'node:child_process'

const env = process.env.VERCEL_ENV // 'production' | 'preview' | 'development' | undefined (local)
if (env === 'production' || process.env.FORCE_MIGRATE === 'true') {
  console.log(`[build] VERCEL_ENV=${env ?? 'unset'} -> running payload migrate`)
  const r = spawnSync('pnpm', ['exec', 'payload', 'migrate'], { stdio: 'inherit' })
  process.exit(r.status ?? 1)
}
console.log(`[build] VERCEL_ENV=${env ?? 'unset'} -> skipping payload migrate (production builds only)`)
