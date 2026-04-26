'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
} from '@/components/Account/AuthForm'

function InloggenInner() {
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search.get('redirect') || '/'
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          body.errors?.[0]?.message ??
            'Inloggen mislukt. Controleer je e-mail en wachtwoord.',
        )
        return
      }
      router.push(redirect)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        label="E-mail"
        name="email"
        type="email"
        required
        autoComplete="email"
      />
      <AuthField
        label="Wachtwoord"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      <AuthError message={error} />
      <AuthButton pending={pending}>Inloggen</AuthButton>
      <p className="text-sm text-c-foreground/60">
        Geen account?{' '}
        <a href="/account/registreren" className="underline">
          Maak er één aan
        </a>
        . Wachtwoord vergeten?{' '}
        <a href="/account/wachtwoord-vergeten" className="underline">
          Reset hier
        </a>
        .
      </p>
    </form>
  )
}

export default function InloggenPage() {
  return (
    <AuthShell title="Inloggen">
      <Suspense fallback={<p>Laden…</p>}>
        <InloggenInner />
      </Suspense>
    </AuthShell>
  )
}
