import type { Access, AccessArgs, Where } from 'payload'
import type { User } from '@/payload-types'

const EDIT_WINDOW_MS = 5 * 60 * 1000

/**
 * Admins always pass. A logged-in author can update/delete their own comment
 * within EDIT_WINDOW_MS of createdAt. Anyone else: no.
 */
export const isAuthorWithinEditWindowOrAdmin: Access = ({
  req: { user },
}: AccessArgs<User>) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const cutoff = new Date(Date.now() - EDIT_WINDOW_MS).toISOString()
  return {
    and: [
      { author: { equals: user.id } },
      { createdAt: { greater_than: cutoff } },
    ],
  } as Where
}
