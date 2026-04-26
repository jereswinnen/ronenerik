import type { CollectionBeforeValidateHook } from 'payload'
import type { User } from '@/payload-types'

/**
 * Force any non-admin user creation to land as the guest role. Stops a
 * public POST to /api/users from including `role: 'admin'` in the body.
 *
 * The role *value* is `'guest'` (the user-facing label is "Gast" — Dutch
 * for guest). Several files across the codebase already check
 * `user.role === 'guest'`; do not rename without a data migration.
 */
export const lockGuestRoleOnCreate: CollectionBeforeValidateHook<User> = ({
  data,
  operation,
  req,
}) => {
  if (!data) return data
  if (operation !== 'create') return data
  const requestingUser = req.user as User | null | undefined
  if (requestingUser?.role === 'admin') return data
  data.role = 'guest'
  return data
}
