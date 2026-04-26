import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'
import type { Comment } from '@/payload-types'

/**
 * Comments are at most one level deep: a top-level comment may have replies,
 * but those replies cannot themselves be replied to. We enforce this at write
 * time by rejecting any comment whose declared parent already has a parent.
 */
export const enforceOneLevel: CollectionBeforeValidateHook<Comment> = async ({
  data,
  req,
}) => {
  if (!data?.parent) return data
  const parentId =
    typeof data.parent === 'object' ? (data.parent as Comment).id : data.parent
  if (!parentId) return data
  const parent = await req.payload.findByID({
    collection: 'comments',
    id: parentId,
    depth: 0,
  })
  if (parent.parent) {
    throw new ValidationError({
      collection: 'comments',
      errors: [
        {
          path: 'parent',
          message: 'Reacties kunnen maar één niveau diep zijn.',
        },
      ],
    })
  }
  return data
}
