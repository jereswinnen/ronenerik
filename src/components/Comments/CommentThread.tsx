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
      className="w-full max-w-2xl mx-auto flex flex-col gap-8 px-4 md:px-0"
    >
      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl md:text-3xl font-bold leading-tight">Reacties</h3>
        <span className="text-c-foreground/50 text-lg">({comments.length})</span>
      </div>
      <span className="w-full h-px bg-c-accent" />
      {topLevel.length === 0 ? (
        <p className="text-c-foreground/60">
          Nog geen reacties. Wees de eerste!
        </p>
      ) : (
        <ul className="flex flex-col gap-8">
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
      <div className="flex flex-col gap-3 pt-4 border-t border-c-foreground/10">
        <h4 className="text-lg font-semibold">Schrijf een reactie</h4>
        <CommentForm postId={postId} />
      </div>
    </section>
  )
}
