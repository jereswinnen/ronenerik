'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@/payload-types'

type UseUserResult = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
}

/**
 * Fetches /api/users/me on mount. Use anywhere on the client that needs to
 * know whether the current visitor is signed in. No global cache: each
 * consumer fetches once; cheap and simple.
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = (await res.json()) as { user?: User | null }
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { user, loading, refresh }
}
