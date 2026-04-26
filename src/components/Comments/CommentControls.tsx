'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { CommentForm } from './CommentForm'
import type { Comment } from '@/payload-types'

const EDIT_WINDOW_MS = 5 * 60 * 1000

type Mode = 'idle' | 'replying' | 'editing'

const richTextToPlain = (data: Comment['content']): string => {
  const root = (data as { root?: { children?: unknown[] } } | null)?.root
  if (!root?.children) return ''
  const lines: string[] = []
  for (const node of root.children as Array<{
    type?: string
    children?: Array<{ type?: string; text?: string }>
  }>) {
    if (node.type !== 'paragraph') continue
    const para = (node.children ?? [])
      .map((c) => {
        if (c.type === 'linebreak') return '\n'
        return c.text ?? ''
      })
      .join('')
    lines.push(para)
  }
  return lines.join('\n\n')
}

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
        initialText={richTextToPlain(comment.content)}
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

  return (
    <div className="flex gap-3 text-xs text-c-foreground/60">
      {canReply && (
        <button onClick={() => setMode('replying')} className="underline">
          Antwoord
        </button>
      )}
      {canEdit && (
        <button onClick={() => setMode('editing')} className="underline">
          Bewerk
        </button>
      )}
      {canEdit && (
        <button
          onClick={handleDelete}
          disabled={pendingDelete}
          className="underline text-red-600"
        >
          Verwijder
        </button>
      )}
    </div>
  )
}
