import type { Metadata } from 'next/types'
import React from 'react'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function PodcastsPage() {
  return (
    <div className="py-[var(--space-4xl)]">
      <div className="container mb-[var(--space-2xl)]">
        <h1
          className="font-bold"
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-heading)',
          }}
        >
          Podcasts
        </h1>
      </div>

      <div className="container">
        <p style={{ color: 'var(--color-text-muted)' }}>
          Podcast episodes will appear here once the RSS feed is configured in Site Settings.
        </p>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Podcasts',
  }
}
