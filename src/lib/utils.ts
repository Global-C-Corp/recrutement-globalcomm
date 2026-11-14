import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const typeLabel = (t: string) => (t === 'stage' ? 'Stage' : 'Emploi')

export function daysSince(date: string | Date): number {
  const ms = Date.now() - new Date(date).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export const daysAgo = (d: number) =>
  d <= 0 ? 'Publiée aujourd’hui' : d === 1 ? 'Publiée hier' : `Publiée il y a ${d} jours`
