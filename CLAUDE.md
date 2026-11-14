# recrutement.globalcomm.ma

Careers site for Global Communication Corporate (Moroccan FMCG communication agency).
Candidates see open job/internship offers and apply with a CV. HR manages offers and applications in the Payload admin.

## Read first
1. This file, fully.
2. `docs/design-reference.html`: the approved clickable demo (open it in a browser, click every page: home, an offer, spontaneous application, thank-you). It is the visual and behavioural source of truth. Read its code for exact spacing, sizes and interactions.
3. Then follow "Build order" below.

## Working rules
- Ask before any repo action: clone, commit, push, merge, deploy. Opening a topic or sharing a link is NOT a go-ahead.
- Everything is built on `main` (no feature branches). Every push to `main` deploys to production, so commit/push only after explicit approval.
- Build everything in one continuous run: do all build steps without stopping for confirmation between them. Stop only for a repo action (commit, push, deploy), a missing secret/license, or a real blocker. At the end, report what works and give ONE manual checklist for the whole site.
- The owner is not a developer. Explain results in plain words, give exact commands, one next action at a time.
- Package manager: pnpm. Never commit secrets. Never print env values.
- Local dev uses a Neon dev branch, never the production database.
- No automated e2e tests. One short manual checklist at the end instead.
- Language of the site: French only, vouvoiement. Talk to the owner in the language they write in.

## Stack
- Next.js (App Router) + Payload CMS 3 in ONE app: admin at `/admin`, site at `/`.
- Database: Neon Postgres (`@payloadcms/db-postgres`). Files: Vercel Blob (`@payloadcms/storage-vercel-blob`).
- Email: `@payloadcms/email-nodemailer` with Titan SMTP (smtp.titan.email, port 465, SSL).
- UI: Tailwind 4 + shadcn/ui, Geist font. Validation: zod.
- Hosting: Vercel project `recrutement-globalcomm`, domain recrutement.globalcomm.ma (attached), Cloudflare DNS only (grey cloud).
- GitHub: `Global-C-Corp/recrutement-globalcomm` (private, empty), branch `main`.

## Hardcoded vs managed in Payload
- **Hardcoded in the Next.js code:** every page layout and text (hero, offers intro, process, positioning/footer, job page section titles, contact card, thank-you page, legal text).
- **Managed in Payload:**
  - **Job offers**, including their **tags**: HR adds, edits, closes and deletes offers in the admin. The site must reflect changes within seconds (`revalidatePath`/`revalidateTag` in `afterChange` and `afterDelete` hooks on `jobs`).
  - **Applications** and uploaded **CVs / portfolios**.

## Routes
| Route | Page |
|---|---|
| `/` | Home: hero, offers, process, positioning/footer |
| `/offres/[slug]` | THE dynamic job template, one for every offer (404 if the offer is not open or unknown) |
| `/candidature-spontanee` | Same layout as the job page, no job details, "Poste visé" dropdown in the form |
| `/merci` | Thank-you page |
| `/admin` | Payload admin (HR only) |
| `POST /api/apply` | Application endpoint |

## Design
- System: Geist (font + 4px spacing scale 4/8/12/16/24/32/48/64/96, 6px radius controls, 12px cards, 4px badges, 40px buttons/inputs), accent `#0000FF`. The designer will deliver the final visual design later: do not invent styling beyond the demo.
- Respect `prefers-reduced-motion` for every animation. Mobile first.

### Home page (sections in order)
- **Hero:** copy vertically centered on the left; right half = image zone (owner uploads the image later, keep a clear placeholder), bottom-aligned; logo marquee at the bottom, plain (no background), content width, overlapping the image. Min-height about 60vh.
- **Offers:** intro marketing copy + one card per open offer (badge Emploi/Stage, title, summary, "Postuler"). NO city anywhere. A spontaneous-application card with the dark blue gradient background.
- **Process ("Comment ça se passe"):** 4 steps (Candidature, Étude de candidature, Premier échange, Entretien), NO timings. React Bits `AccordionGallery` (hover to expand, 190px high, expandRatio 0.52, grayscale inactive, parallax 0.5, tilt 8, stagger 0.06, gap 10, radius 16). Title typography must NOT change when a panel expands. Images supplied later (gradient placeholders until then).
- **Positioning / footer:** big centered statement using React Bits `VariableProximity` (weight 400 to 900, radius 100 to 110, linear falloff, smoothing 0.2). Background: Glyph Ember from React Bits Pro (see "Glyph Ember" below). Colors from the `#0000FF` family. Footer row inside the section: copyright + globalcomm.ma link.

### Job page `/offres/[slug]` (approved, single dynamic template)
- Rendered from the `jobs` document. No per-offer pages built by hand.
- **Header:** light band with a faint blue grid background fading out; back link "← Toutes les offres"; company line (logo square + "Global Communication Corporate" + "Publiée il y a X jours" computed from `createdAt` + badge Emploi/Stage); H1 title; row of tag pills from `jobs.tags` (32px high, icon + label + bold value).
- **Body:** two columns, content on the left, 400px sticky form card on the right (sticky top 24px), column gap 64px. Left sections (hardcoded titles, single colour, 24px): "Présentation du poste" (`summary`), "Vos missions", "Profil recherché", "Ce que nous offrons" (bullet lists). 12px between a title and its content, 48px between sections, no dividers.
- **Form card instead of an Apply button.** A 4px progress line at the very top of the card fills as the candidate completes fields (6 fields: nom, email, téléphone, CV, Portfolio / LinkedIn, consentement), with a "n / 6" counter. Client-side only, nothing stored.
- **Mobile:** single column (content, then form); a sticky "Postuler" bar scrolls to the form.
- **Contact card** at the bottom (job page and spontaneous page), content width, Glyph Ember background, everything centered: logo placeholder (dashed "Logo" box, owner uploads the logo later), "Une question sur le poste ?", short line, `rh@globalcomm.ma` (mailto) and `(+212) 668 49 09 07` (tel:+212668490907). Hardcoded.

### Glyph Ember
- React Bits Pro component: `npx shadcn@latest add @reactbits-starter/glyph-ember-tw`. It needs the owner's Pro license key in the `components.json` registry config: ASK the owner for it, never guess the registry.
- Until it is available, use the demo's own canvas ASCII "ember" stand-in (function `initPositioning` in `docs/design-reference.html`, parametrised by section/canvas ids) in both places (positioning section and contact card) and flag it clearly in your report.

## Data model (Payload)
- `users`: HR admins only (Payload auth).
- `jobs`:
  - `title`, `slug` (auto from title, unique), `type` (emploi | stage), `summary`
  - `tags[]`: array of `{ icon: select contract|mode|experience|languages|education|other, label, value }`, edited by HR (e.g. Type de contrat / CDI, Lieu de travail / Sur site, Expérience / 2 - 5 ans, Langues / Français, Niveau d'étude / BAC +3 et plus)
  - `missions[]`, `profil[]`, `offre[]` (arrays of short text)
  - `status` (open | closed), `order` (number, manual sorting)
  - No city field. Public read = open offers only; authenticated users see all.
- `applications`: `fullName`, `email`, `phone`, `type` (emploi | stage | spontanee), `job` (optional relation), `targetRole` (text, for spontaneous), `cv` (upload), `portfolioUrl` (optional, label "Portfolio / LinkedIn"), `portfolioFile` (optional upload), `consent`, `status` (new | reviewing | interview | accepted | rejected), `notes` (internal). No message field. No public create/read: submissions go only through the server route.
- `media`: private. Read for authenticated users only; downloads go through Payload access control.
- Admin UX: French labels, sensible list columns (applications: name, type, job, status, date; jobs: title, type, status), filter applications by status/job.

## Application flow
1. Single-step form, no account: name, email, phone, CV, "Portfolio / LinkedIn" (optional, link and/or PDF), consent checkbox (loi 09-08). The offer is pre-filled; the spontaneous form has a "Poste visé" dropdown listing open offers plus "Candidature ouverte". Inline field errors, "Envoi…" state, redirect to `/merci`.
2. `POST /api/apply` (server route): validate with zod; CV accepts PDF, DOC, DOCX up to 5 MB, portfolio file PDF up to 10 MB (check real file signatures, not just extensions); honeypot field; basic rate limit; create media then application with the Local API.
3. Emails: notify `HR_NOTIFY_EMAIL` on each new application (with the admin link) and send the candidate an automatic confirmation. No promised response time in any email or page. An email failure must never lose the application: log it and continue.

## Environment variables (Vercel, Production only)
`DATABASE_URL` (Neon integration, pooled), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `HR_NOTIFY_EMAIL`, `BLOB_READ_WRITE_TOKEN`.
- Ignore the extra `POSTGRES_*`, `PG*`, `NEON_AUTH_*`, `VITE_*` vars from the Neon integration.
- Preview scope has no app vars yet.
- Local dev uses a gitignored `.env` pointing to a Neon dev branch.

## Build order (one continuous run, no confirmation between steps)
1. Scaffold Payload + Next.js (blank, Postgres), connect to the Neon dev branch, create the first admin, run locally.
2. Collections, access rules and revalidation hooks. Add a dev-only seed script that creates the 3 sample offers from the demo (run only against the Neon dev branch).
3. Design foundations: Tailwind 4, shadcn, Geist tokens; copy the demo to `docs/design-reference.html`.
4. Home page sections, job template `/offres/[slug]`, spontaneous page, thank-you page, reading offers from Payload.
5. Application form (with progress line), `/api/apply`, both emails.
6. Security pass: access rules, CV privacy, rate limit, security headers.
7. First deploy to Vercel (owner confirms), create the first real offer in `/admin`, test with a real CV and a real email.

## Known pitfalls
- Run `pnpm generate:types` and `pnpm generate:importmap` after schema or plugin changes.
- Verify Titan SMTP login before relying on emails; never crash a request on email failure.
- CV privacy: confirm uploaded CVs are not reachable by a public URL (Vercel Blob URLs can be public). Serve them only through Payload access control; if the plugin exposes direct blob URLs, tell the owner and fix before deploying.
- The domain is attached in Vercel; keep the Cloudflare CNAME grey-clouded.
- Deleting an offer must not break existing applications that reference it: prefer "closed" and keep the relation optional.
- A throwaway prototype exists outside this repo. Do not assume its code is present or approved.

## Definition of done
- All routes above work locally and on production; the demo's look and behaviour are matched on desktop and mobile.
- HR can add/edit/close/delete an offer (with tags) in `/admin` and the site updates within seconds.
- A real application with a real CV creates an application in `/admin`, sends the HR email and the candidate confirmation, and the CV is not publicly reachable.
- Final report: what works, what is a stand-in (Glyph Ember, logo, hero image, gallery images), and the single manual checklist.
