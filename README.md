# recrutement-globalcomm

Site carrières de Global Communication Corporate (Next.js + Payload 3). Voir `CLAUDE.md`.

```bash
pnpm install
cp .env.example .env      # renseigner DATABASE_URL (branche Neon de dev) et PAYLOAD_SECRET
pnpm dev                  # http://localhost:3000, admin sur /admin
pnpm seed                 # dev uniquement : 3 offres d'exemple (ALLOW_SEED=true dans .env)
```
