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
    <header className="sticky top-0 z-20 bg-c-background/80 backdrop-blur-md border-b border-c-foreground/10 h-16">
      <div className="container h-full flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          {siteName || 'Home'}
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
