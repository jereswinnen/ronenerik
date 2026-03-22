'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function ViewTransition() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname

    if (!document.startViewTransition) return

    // The DOM has already been updated by Next.js at this point,
    // so we snapshot the current state and let the transition animate
    document.startViewTransition()
  }, [pathname])

  return null
}
