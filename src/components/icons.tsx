import type { ReactNode } from 'react'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const Svg = ({ children, sw }: { children: ReactNode; sw?: number }) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={sw ?? 1.8} aria-hidden="true">{children}</svg>
)

export const TAG_ICONS: Record<string, ReactNode> = {
  contract: <Svg><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></Svg>,
  mode: <Svg><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /></Svg>,
  experience: <Svg><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Svg>,
  languages: <Svg><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Svg>,
  education: <Svg><path d="m22 10-10-5L2 10l10 5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></Svg>,
  other: <Svg><path d="M20 13 13 20a2 2 0 0 1-3 0L3 13V4h9l8 8a1 1 0 0 1 0 1z" /><circle cx="8" cy="8" r="1.2" /></Svg>,
}

export const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
)
export const MailIcon = () => <Svg><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>
export const PhoneIcon = () => <Svg><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Svg>

export const BRAND_ICONS: ReactNode[] = [
  <svg key="0" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" /></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 22 21H2z" /></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3" /></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8 5.6 21.5l1.7-7.2L2 9.6 9 9z" /></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 22 12 12 22 2 12z" /></svg>,
  <svg key="5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v6H4zM4 14h10v6H4z" /></svg>,
]
