'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

type Props = {
  postId: string | number
  parentId?: string | number
  initialText?: string
  commentId?: string | number
  mode?: 'create' | 'edit'
  onDone?: () => void
}

const lexicalFromPlainText = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: text
      .split(/\n{2,}/)
      .filter((p) => p.trim().length > 0)
      .map((para) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: para.split('\n').flatMap((line, idx, arr) => {
          const node = {
            type: 'text',
            text: line,
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
            version: 1,
          }
          return idx < arr.length - 1
            ? [node, { type: 'linebreak', version: 1 }]
            : [node]
        }),
      })),
  },
})

export function CommentForm({
  postId,
  parentId,
  initialText = '',
  commentId,
  mode = 'create',
  onDone,
}: Props) {
  const router = useRouter()
  const { user, loading } = useUser()
  const [text, setText] = useState(initialText)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (loading) {
    return <p className="text-sm text-c-foreground/50">Laden…</p>
  }

  if (!user) {
    return (
      <p className="text-sm">
        <Link href="/account/inloggen" className="underline">
          Log in
        </Link>{' '}
        of{' '}
        <Link href="/account/registreren" className="underline">
          maak een account aan
        </Link>{' '}
        om te reageren.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (text.trim().length === 0) {
      setError('Reactie kan niet leeg zijn.')
      return
    }
    setPending(true)
    try {
      const body = {
        post: postId,
        parent: parentId ?? undefined,
        content: lexicalFromPlainText(text),
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
          json.errors?.[0]?.message ??
            'Reactie kon niet opgeslagen worden.',
        )
        return
      }
      setText('')
      onDone?.()
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="sr-only">
          {mode === 'edit' ? 'Reactie bewerken' : 'Schrijf een reactie'}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="border border-c-foreground/20 rounded p-3 bg-c-background"
          placeholder={
            parentId
              ? 'Antwoord hierop…'
              : 'Schrijf hier je reactie. Lege regels maken een nieuwe alinea.'
          }
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-c-foreground text-c-background rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? 'Versturen…' : mode === 'edit' ? 'Opslaan' : 'Plaats reactie'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded px-4 py-2 text-sm border border-c-foreground/20"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  )
}
