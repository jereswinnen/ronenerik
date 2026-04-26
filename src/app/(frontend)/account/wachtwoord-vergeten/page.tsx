'use client'

import React, { useState } from 'react'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
  AuthSuccess,
} from '@/components/Account/AuthForm'

export default function WachtwoordVergetenPage() {
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(form.get('email') ?? ''),
        }),
      })
      if (!res.ok) {
        setError('Aanvraag mislukt. Probeer het later opnieuw.')
        return
      }
      setSubmitted(true)
    } finally {
      setPending(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell title="Check je inbox">
        <AuthSuccess message="Als je e-mailadres bekend is, sturen we je een link om je wachtwoord opnieuw in te stellen." />
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Wachtwoord vergeten">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <AuthError message={error} />
        <AuthButton pending={pending}>Stuur reset-link</AuthButton>
      </form>
    </AuthShell>
  )
}
