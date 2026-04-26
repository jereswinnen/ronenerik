'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
} from '@/components/Account/AuthForm'

function WachtwoordInstellenInner() {
  const router = useRouter()
  const search = useSearchParams()
  const token = search.get('token') || ''
  const [error, setError] = useState<string | null>(null)
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
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        setError('Reset mislukt. De link is mogelijk verlopen.')
        return
      }
      router.push('/account/inloggen')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        label="Nieuw wachtwoord"
        name="password"
        type="password"
        required
        autoComplete="new-password"
      />
      <AuthField
        label="Nieuw wachtwoord (herhalen)"
        name="passwordConfirm"
        type="password"
        required
        autoComplete="new-password"
      />
      <AuthError message={error} />
      <AuthButton pending={pending}>Wachtwoord instellen</AuthButton>
    </form>
  )
}

export default function WachtwoordInstellenPage() {
  return (
    <AuthShell title="Nieuw wachtwoord instellen">
      <Suspense fallback={<p>Laden…</p>}>
        <WachtwoordInstellenInner />
      </Suspense>
    </AuthShell>
  )
}
