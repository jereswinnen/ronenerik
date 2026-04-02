import type { Access, AccessArgs } from 'payload'
import type { User } from '@/payload-types'

/**
 * Admin: full access. Guest: only documents where the given field contains their user ID.
 * Use for Posts (authors field).
 */
export const isAdminOrOwner = (ownerField: string): Access => {
  return ({ req: { user } }: AccessArgs<User>) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return { [ownerField]: { contains: user.id } }
  }
}

/**
 * Admin: full access. Guest: only their own user document.
 * Use for the Users collection.
 */
export const isAdminOrSelfUser: Access = ({ req: { user } }: AccessArgs<User>) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

/**
 * Admin: full access. Guest: only documents where createdBy equals their user ID.
 * Use for Media (exact match, not array contains).
 */
export const isAdminOrCreator = (ownerField: string): Access => {
  return ({ req: { user } }: AccessArgs<User>) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return { [ownerField]: { equals: user.id } }
  }
}
