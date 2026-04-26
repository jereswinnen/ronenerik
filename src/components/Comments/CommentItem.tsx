import React from 'react'
import RichText from '@/components/RichText'
import type { Comment, User } from '@/payload-types'

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('nl-BE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))

type Props = {
  comment: Comment
  replies?: Comment[]
  postId: string | number
  postSlug: string
}

export function CommentItem({ comment, replies = [], postId, postSlug }: Props) {
  const author =
    comment.author && typeof comment.author === 'object'
      ? (comment.author as User)
      : null
  const name = author?.name || 'Onbekend'
  const editedSuffix = comment.editedAt ? ' (bewerkt)' : ''

  return (
    <li className="flex flex-col gap-2 border-l-2 border-c-foreground/10 pl-4">
      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-c-foreground/50">
          {formatDate(comment.createdAt)}
          {editedSuffix}
        </span>
      </div>
      <div className="prose prose-sm">
        <RichText data={comment.content} enableGutter={false} />
      </div>
      {/* Edit/delete + reply controls live in the client form mounted by CommentThread */}
      <div data-comment-controls={comment.id} />
      {replies.length > 0 && (
        <ul className="flex flex-col gap-4 mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              postSlug={postSlug}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
