import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Host_Grotesk } from 'next/font/google'
import React from 'react'

import { Footer } from '@/components/(frontend)/Footer'
import { Header } from '@/components/(frontend)/Header'
import { ViewTransition } from '@/components/ViewTransition'
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
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        <link href="/favicon-192.png" rel="icon" type="image/png" sizes="192x192" />
        <link href="/favicon-512.png" rel="icon" type="image/png" sizes="512x512" />
      </head>
      <body className="antialiased text-balance">
        <Providers>
          <ViewTransition />
          <Header />
          <main className="mb-12 md:mb-20 flex-1 flex flex-col gap-y-20 md:gap-y-34">
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
