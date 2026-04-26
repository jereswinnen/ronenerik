'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AuthError,
  AuthShell,
  AuthSuccess,
} from '@/components/Account/AuthForm'

type Status = 'pending' | 'ok' | 'error'

function VerifieerInner() {
  const search = useSearchParams()
  const token = search.get('token')
  const [status, setStatus] = useState<Status>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Geen geldige token in de URL.')
      return
    }
    void (async () => {
      const res = await fetch(`/api/users/verify/${encodeURIComponent(token)}`, {
        method: 'POST',
      })
      if (res.ok) {
        setStatus('ok')
      } else {
        const body = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          body.errors?.[0]?.message ??
            'Bevestigen mislukt. De link is mogelijk verlopen.',
        )
        setStatus('error')
      }
    })()
  }, [token])

  return (
    <>
      {status === 'pending' && <p>Bezig met bevestigen…</p>}
      {status === 'ok' && (
        <AuthSuccess message="Je e-mailadres is bevestigd. Je kan nu inloggen." />
      )}
      {status === 'error' && <AuthError message={error} />}
      {status !== 'pending' && (
        <p className="text-sm">
          <a href="/account/inloggen" className="underline">
            Naar inloggen
          </a>
        </p>
      )}
    </>
  )
}

export default function VerifieerPage() {
  return (
    <AuthShell title="E-mail bevestigen">
      <Suspense fallback={<p>Bezig met bevestigen…</p>}>
        <VerifieerInner />
      </Suspense>
    </AuthShell>
  )
}
