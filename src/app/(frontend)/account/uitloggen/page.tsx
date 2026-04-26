'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthShell } from '@/components/Account/AuthForm'

export default function UitloggenPage() {
  const router = useRouter()
  useEffect(() => {
    void (async () => {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/')
      router.refresh()
    })()
  }, [router])

  return (
    <AuthShell title="Uitloggen…">
      <p>Een ogenblik geduld.</p>
    </AuthShell>
  )
}
