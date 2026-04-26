import type { CollectionBeforeChangeHook } from 'payload'
import type { Comment } from '@/payload-types'

/**
 * Stamp `editedAt` whenever the body of an existing comment changes. We
 * compare serialized JSON because Lexical content is a nested object.
 */
export const setEditedAt: CollectionBeforeChangeHook<Comment> = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update') return data
  if (!data?.content) return data
  const before = JSON.stringify(originalDoc?.content ?? null)
  const after = JSON.stringify(data.content)
  if (before !== after) {
    data.editedAt = new Date().toISOString()
  }
  return data
}
