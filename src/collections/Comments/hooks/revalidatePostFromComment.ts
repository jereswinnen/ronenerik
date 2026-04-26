import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { revalidatePath } from 'next/cache'
import type { Comment, Post } from '@/payload-types'

const slugFromPost = async (
  postRef: Comment['post'] | undefined,
  payload: Parameters<CollectionAfterChangeHook<Comment>>[0]['req']['payload'],
): Promise<string | null> => {
  if (!postRef) return null
  // Guard truthiness BEFORE typeof — `typeof null === 'object'` in JS.
  if (postRef && typeof postRef === 'object') {
    return (postRef as Post).slug ?? null
  }
  try {
    const post = await payload.findByID({
      collection: 'posts',
      id: postRef as number | string,
      depth: 0,
    })
    return post.slug ?? null
  } catch {
    return null
  }
}

export const revalidatePostFromCommentChange: CollectionAfterChangeHook<Comment> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  const slug = await slugFromPost(doc.post, payload)
  if (slug) {
    revalidatePath(`/artikels/${slug}`)
  }
  return doc
}

export const revalidatePostFromCommentDelete: CollectionAfterDeleteHook<Comment> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  const slug = await slugFromPost(doc?.post, payload)
  if (slug) {
    revalidatePath(`/artikels/${slug}`)
  }
  return doc
}
