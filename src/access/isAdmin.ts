import type { Access, AccessArgs, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export const isAdmin: Access = ({ req: { user } }: AccessArgs<User>) => {
  if (user && user.role === 'admin') return true
  return false
}

export const isAdminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user && (user as User).role === 'admin') return true
  return false
}
