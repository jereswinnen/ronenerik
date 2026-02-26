'use client'
import Link from 'next/link'
import React from 'react'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  siteName?: string
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, siteName }) => {
  return (
    <header
      className="sticky top-0 z-20 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="container h-full flex items-center justify-between">
        <Link href="/" className="font-bold text-lg" style={{ color: 'var(--color-heading)' }}>
          {siteName || 'Home'}
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
