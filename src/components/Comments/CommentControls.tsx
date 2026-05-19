'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SerializedEditorState } from 'lexical'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/(frontend)/Button'
import { CommentForm } from './CommentForm'
import type { Comment } from '@/payload-types'

const EDIT_WINDOW_MS = 5 * 60 * 1000

type Mode = 'idle' | 'replying' | 'editing'

type Props = {
  comment: Comment
  postId: string | number
  isReply: boolean
}

export function CommentControls({ comment, postId, isReply }: Props) {
  const router = useRouter()
  const { user } = useUser()
  const [mode, setMode] = useState<Mode>('idle')
  const [pendingDelete, setPendingDelete] = useState(false)

  const authorId =
    comment.author && typeof comment.author === 'object'
      ? comment.author?.id
      : comment.author
  const isOwner = user && authorId && user.id === authorId
  const isAdmin = user?.role === 'admin'
  const withinWindow =
    Date.now() - new Date(comment.createdAt).getTime() < EDIT_WINDOW_MS
  const canEdit = (isOwner && withinWindow) || isAdmin
  const canReply = !!user && !isReply

  const handleDelete = async () => {
    if (!confirm('Reactie verwijderen?')) return
    setPendingDelete(true)
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        alert('Verwijderen mislukt.')
        return
      }
      router.refresh()
    } finally {
      setPendingDelete(false)
    }
  }

  if (mode === 'editing') {
    return (
      <CommentForm
        postId={postId}
        commentId={comment.id}
        mode="edit"
        initialContent={comment.content as SerializedEditorState}
        onDone={() => setMode('idle')}
      />
    )
  }

  if (mode === 'replying') {
    return (
      <CommentForm
        postId={postId}
        parentId={comment.id}
        onDone={() => setMode('idle')}
      />
    )
  }

  if (!canReply && !canEdit) return null

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {canReply && (
        <Button variant="secondary" type="button" onClick={() => setMode('replying')}>
          Antwoord
        </Button>
      )}
      {canEdit && (
        <Button variant="secondary" type="button" onClick={() => setMode('editing')}>
          Bewerk
        </Button>
      )}
      {canEdit && (
        <Button
          variant="secondary"
          tone="danger"
          type="button"
          onClick={handleDelete}
          disabled={pendingDelete}
        >
          Verwijder
        </Button>
      )}
    </div>
  )
}
