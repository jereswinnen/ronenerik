import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Host_Grotesk } from 'next/font/google'
import React from 'react'

import { Footer } from '@/components/(frontend)/Footer'
import { Header } from '@/components/(frontend)/Header'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-host-grotesk',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(hostGrotesk.variable)} lang="en">
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="antialiased text-balance">
        <Providers>
          <Header />
          <main className="mb-8 md:mb-20 flex-1 flex flex-col gap-y-12 md:gap-y-30">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'Ron en Erik',
    template: '%s | Ron en Erik',
  },
  description: 'De Ron en Erik Podcast',
  openGraph: mergeOpenGraph(),
}
