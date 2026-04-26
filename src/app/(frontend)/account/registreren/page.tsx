'use client'

import React, { useState } from 'react'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
  AuthSuccess,
} from '@/components/Account/AuthForm'

export default function RegistrerenPage() {
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password') ?? '')
    const passwordConfirm = String(form.get('passwordConfirm') ?? '')
    if (password !== passwordConfirm) {
      setError('De wachtwoorden komen niet overeen.')
      setPending(false)
      return
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: String(form.get('email') ?? ''),
          name: String(form.get('name') ?? ''),
          password,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          body.errors?.[0]?.message ??
            'Er ging iets mis bij het aanmaken van je account.',
        )
        return
      }
      setSubmitted(true)
    } finally {
      setPending(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell title="Bevestig je e-mailadres">
        <AuthSuccess message="We hebben je een bevestigingsmail gestuurd. Klik op de link in die mail om je account te activeren." />
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Account aanmaken">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label="Naam" name="name" required autoComplete="name" />
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
          autoComplete="new-password"
        />
        <AuthField
          label="Wachtwoord (herhalen)"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
        />
        <AuthError message={error} />
        <AuthButton pending={pending}>Account aanmaken</AuthButton>
        <p className="text-sm text-c-foreground/60">
          Al een account? <a href="/account/inloggen" className="underline">Inloggen</a>
        </p>
      </form>
    </AuthShell>
  )
}
