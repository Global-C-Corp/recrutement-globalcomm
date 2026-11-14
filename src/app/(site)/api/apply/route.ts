import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fileTypeFromBuffer } from 'file-type'
import { randomUUID } from 'crypto'
import { getPayloadClient } from '@/lib/payload'
import { rateLimited } from '@/lib/rate-limit'
import { sendApplicationEmails } from '@/lib/emails'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MB = 1048576
const CV_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  cfb: 'application/msword', // legacy .doc (OLE2 container)
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}
const PF_TYPES: Record<string, string> = { pdf: 'application/pdf' }

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().max(200).email(),
  phone: z.string().trim().max(40).refine((s) => /^[+\d\s().-]+$/.test(s) && s.replace(/\D/g, '').length >= 9, 'invalid'),
  portfolioUrl: z.string().trim().max(300).optional().transform((s) => s || undefined)
    .refine((s) => !s || /^https?:\/\/\S+$/i.test(s), 'invalid'),
  consent: z.literal('on'),
  job: z.string().trim().max(200).optional(),
  target: z.string().trim().max(200).optional(),
})

const fail = (error: string, status = 400, fields?: Record<string, string>) =>
  NextResponse.json({ error, fields }, { status })

async function checkedFile(file: FormDataEntryValue | null, max: number, allowed: Record<string, string>) {
  if (!(file instanceof File) || file.size === 0) return null
  if (file.size > max) throw new Error('size')
  const buf = Buffer.from(await file.arrayBuffer())
  const ft = await fileTypeFromBuffer(buf) // real signature, not the extension
  if (!ft || !allowed[ft.ext]) throw new Error('type')
  return { buf, ext: ft.ext === 'cfb' ? 'doc' : ft.ext, mime: allowed[ft.ext] }
}

export async function POST(req: Request) {
  // Same-origin only
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (origin && host && new URL(origin).host !== host) return fail('Requête refusée.', 403)

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(`apply:${ip}`)) return fail('Trop de tentatives. Veuillez réessayer plus tard.', 429)

  let form: FormData
  try { form = await req.formData() } catch { return fail('Formulaire invalide.') }

  // Honeypot: pretend success, store nothing
  if (String(form.get('website') ?? '').trim() !== '') return NextResponse.json({ ok: true })

  const parsed = schema.safeParse({
    fullName: form.get('fullName') ?? '',
    email: form.get('email') ?? '',
    phone: form.get('phone') ?? '',
    portfolioUrl: form.get('portfolioUrl') ?? undefined,
    consent: form.get('consent') ?? '',
    job: form.get('job') ?? undefined,
    target: form.get('target') ?? undefined,
  })
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const i of parsed.error.issues) fields[String(i.path[0])] = i.message
    return fail('Veuillez vérifier les champs du formulaire.', 400, fields)
  }
  const d = parsed.data

  let cv, pf
  try { cv = await checkedFile(form.get('cv'), 5 * MB, CV_TYPES) }
  catch (e) { return fail((e as Error).message === 'size' ? 'CV trop volumineux (5 Mo max).' : 'Format de CV non accepté (PDF, DOC ou DOCX).', 400, { cv: 'invalid' }) }
  if (!cv) return fail('Ajoutez votre CV.', 400, { cv: 'required' })
  try { pf = await checkedFile(form.get('portfolioFile'), 10 * MB, PF_TYPES) }
  catch (e) { return fail((e as Error).message === 'size' ? 'Portfolio trop volumineux (10 Mo max).' : 'Le portfolio doit être un PDF.', 400, { portfolioFile: 'invalid' }) }

  const payload = await getPayloadClient()

  // Resolve the offer / target role from open offers only
  let jobId: number | undefined
  let type: 'emploi' | 'stage' | 'spontanee' = 'spontanee'
  let targetRole = 'Candidature ouverte'
  const slug = d.job || (d.target && d.target !== 'open' ? d.target : undefined)
  if (slug) {
    const res = await payload.find({
      collection: 'jobs', limit: 1, depth: 0, overrideAccess: false,
      where: { and: [{ slug: { equals: slug } }, { status: { equals: 'open' } }] },
    })
    const job = res.docs[0]
    if (!job) return fail('Cette offre n’est plus ouverte.', 400)
    targetRole = job.title
    if (d.job) { jobId = job.id; type = job.type }
  }

  try {
    const cvDoc = await payload.create({
      collection: 'media', data: {}, overrideAccess: true,
      file: { data: cv.buf, mimetype: cv.mime, name: `cv-${randomUUID()}.${cv.ext}`, size: cv.buf.length },
    })
    const pfDoc = pf
      ? await payload.create({
          collection: 'media', data: {}, overrideAccess: true,
          file: { data: pf.buf, mimetype: pf.mime, name: `portfolio-${randomUUID()}.pdf`, size: pf.buf.length },
        })
      : null

    const app = await payload.create({
      collection: 'applications', overrideAccess: true,
      data: {
        fullName: d.fullName, email: d.email, phone: d.phone, type,
        job: jobId, targetRole, cv: cvDoc.id, portfolioUrl: d.portfolioUrl,
        portfolioFile: pfDoc?.id, consent: true, status: 'new',
      },
    })

    await sendApplicationEmails(payload, {
      id: app.id, fullName: d.fullName, email: d.email, phone: d.phone,
      typeLabel: type === 'spontanee' ? 'Spontanée' : type === 'stage' ? 'Stage' : 'Emploi',
      target: targetRole, portfolioUrl: d.portfolioUrl,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    payload.logger.error({ err, msg: 'Échec de création de candidature' })
    return fail('Une erreur est survenue. Veuillez réessayer.', 500)
  }
}
