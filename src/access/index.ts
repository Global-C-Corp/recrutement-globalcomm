import type { Access } from 'payload'

export const isAuthenticated: Access = ({ req }) => Boolean(req.user)

/** Public sees only open offers, HR sees everything. */
export const openOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true
  return { status: { equals: 'open' } }
}
