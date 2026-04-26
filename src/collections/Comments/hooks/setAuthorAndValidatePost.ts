import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'
import type { Comment, Post, User } from '@/payload-types'

/**
 * On create: force `author` to the requesting user (no spoofing) and reject
 * the create when the target post has comments disabled.
 */
export const setAuthorAndValidatePost: CollectionBeforeChangeHook<Comment> = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data
  const user = req.user as User | null | undefined
  if (!user) {
    throw new APIError('Je moet ingelogd zijn om te reageren.', 401)
  }
  data.author = user.id

  const postId =
    typeof data.post === 'object' ? (data.post as Post).id : data.post
  if (!postId) {
    throw new APIError('Reactie heeft geen artikel.', 400)
  }
  const post = await req.payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 0,
  })
  if (!post.commentsEnabled) {
    throw new APIError('Reacties zijn uitgeschakeld voor dit artikel.', 403)
  }
  return data
}
