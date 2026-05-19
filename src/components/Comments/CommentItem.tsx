import React from 'react'
import RichText from '@/components/RichText'
import type { Comment, User } from '@/payload-types'
import { CommentControls } from './CommentControls'

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

  const isReply = Boolean(comment.parent)

  return (
    <li
      className={`flex flex-col gap-3 ${
        isReply ? 'pl-5 border-l-2 border-c-accent/30' : ''
      }`}
    >
      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <span className="font-semibold text-c-foreground">{name}</span>
        <span className="text-sm text-c-foreground/50">
          {formatDate(comment.createdAt)}
          {editedSuffix}
        </span>
      </div>
      <div className="prose prose-sm max-w-none text-c-foreground/90">
        <RichText data={comment.content} enableGutter={false} />
      </div>
      <CommentControls comment={comment} postId={postId} isReply={isReply} />
      {replies.length > 0 && (
        <ul className="flex flex-col gap-6 mt-3">
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
