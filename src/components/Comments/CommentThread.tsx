import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Comment } from '@/payload-types'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'

type Props = {
  postId: string | number
  postSlug: string
}

export async function CommentThread({ postId, postSlug }: Props) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'comments',
    where: { post: { equals: postId } },
    sort: 'createdAt',
    depth: 1,
    limit: 200,
    overrideAccess: true,
  })

  const comments = result.docs as Comment[]
  const topLevel = comments.filter((c) => !c.parent)
  const repliesByParent = new Map<string | number, Comment[]>()
  for (const c of comments) {
    if (!c.parent) continue
    const parentId =
      c.parent && typeof c.parent === 'object'
        ? (c.parent as Comment).id
        : c.parent
    const list = repliesByParent.get(parentId) ?? []
    list.push(c)
    repliesByParent.set(parentId, list)
  }

  return (
    <section
      id="reacties"
      className="w-full max-w-2xl mx-auto flex flex-col gap-6 px-4 md:px-0"
    >
      <h3 className="text-xl font-bold">Reacties ({comments.length})</h3>
      {topLevel.length === 0 ? (
        <p className="text-sm text-c-foreground/60">
          Nog geen reacties. Wees de eerste!
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesByParent.get(c.id) ?? []}
              postId={postId}
              postSlug={postSlug}
            />
          ))}
        </ul>
      )}
      <CommentForm postId={postId} />
    </section>
  )
}
