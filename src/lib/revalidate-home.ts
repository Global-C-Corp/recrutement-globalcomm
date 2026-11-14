import { revalidatePath, revalidateTag } from 'next/cache'

export function revalidateHome() {
  try {
    revalidateTag('client-logos', { expire: 0 })
    revalidatePath('/')
  } catch {
    // outside a Next request context (seed script): ignore
  }
}
