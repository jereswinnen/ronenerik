import type { Metadata } from 'next/types'
import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { PodcastEpisodeCard } from '@/components/PodcastEpisodeCard'
import type { SiteSetting } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function PodcastsPage() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl

  const episodes = feedUrl ? await fetchPodcastEpisodes(feedUrl) : []

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
        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {episodes.map((ep, i) => (
              <PodcastEpisodeCard key={i} episode={ep} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {feedUrl
              ? 'No episodes found.'
              : 'Configure your podcast RSS feed in Site Settings.'}
          </p>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Podcasts',
  }
}
