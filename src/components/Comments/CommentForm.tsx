'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SerializedEditorState } from 'lexical'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/(frontend)/Button'
import { CommentEditor, isEmptyContent } from './CommentEditor'

type Props = {
  postId: string | number
  parentId?: string | number
  initialContent?: SerializedEditorState | null
  commentId?: string | number
  mode?: 'create' | 'edit'
  onDone?: () => void
}

export function CommentForm({
  postId,
  parentId,
  initialContent = null,
  commentId,
  mode = 'create',
  onDone,
}: Props) {
  const router = useRouter()
  const { user, loading } = useUser()
  const [content, setContent] = useState<SerializedEditorState | null>(initialContent)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  // Force-remount the editor after a successful submit so it clears.
  const [editorKey, setEditorKey] = useState(0)

  if (loading) {
    return <p className="text-c-foreground/50">Laden…</p>
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-c-foreground/70">
          Log in of maak een account aan om te reageren.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/account/inloggen">Inloggen</Button>
          <Button href="/account/registreren" variant="secondary">
            Registreren
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!content || isEmptyContent(content)) {
      setError('Reactie kan niet leeg zijn.')
      return
    }
    setPending(true)
    try {
      const body = {
        post: postId,
        parent: parentId ?? undefined,
        content,
      }
      const url =
        mode === 'edit' && commentId
          ? `/api/comments/${commentId}`
          : '/api/comments'
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          json.errors?.[0]?.message ?? 'Reactie kon niet opgeslagen worden.',
        )
        return
      }
      setContent(null)
      setEditorKey((k) => k + 1)
      onDone?.()
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <CommentEditor
        key={editorKey}
        initialContent={initialContent}
        onChange={setContent}
        placeholder={parentId ? 'Antwoord hierop…' : 'Schrijf hier je reactie…'}
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3 mt-1">
        <Button type="submit" disabled={pending}>
          {pending ? 'Versturen…' : mode === 'edit' ? 'Opslaan' : 'Plaats reactie'}
        </Button>
        {onDone && (
          <Button variant="secondary" type="button" onClick={onDone}>
            Annuleren
          </Button>
        )}
      </div>
    </form>
  )
}
