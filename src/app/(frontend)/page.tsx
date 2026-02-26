import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { Card } from '@/components/Card'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { fetchYouTubeVideos } from '@/utilities/rss/fetchYouTube'
import { PodcastEpisodeCard } from '@/components/PodcastEpisodeCard'
import { YouTubeVideoCard } from '@/components/YouTubeVideoCard'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  const articles = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 6,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
  })

  const podcastFeedUrl = siteSettings?.externalLinks?.podcastFeedUrl
  const youtubeChannelUrl = siteSettings?.externalLinks?.youtubeChannelUrl

  const [episodes, videos] = await Promise.all([
    podcastFeedUrl ? fetchPodcastEpisodes(podcastFeedUrl, 4) : Promise.resolve([]),
    youtubeChannelUrl ? fetchYouTubeVideos(youtubeChannelUrl, 4) : Promise.resolve([]),
  ])

  return (
    <div className="py-[var(--space-4xl)]">
      {/* Hero */}
      <section className="container mb-[var(--space-4xl)]">
        <h1
          className="font-bold mb-[var(--space-md)]"
          style={{
            fontSize: 'var(--font-size-5xl)',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-heading)',
          }}
        >
          {siteSettings?.general?.siteName || 'Welcome'}
        </h1>
        {siteSettings?.general?.tagline && (
          <p
            className="max-w-2xl"
            style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)' }}
          >
            {siteSettings.general.tagline}
          </p>
        )}
      </section>

      {/* Latest Articles */}
      {articles.docs.length > 0 && (
        <section className="container mb-[var(--space-4xl)]">
          <SectionHeader title="Latest Articles" href="/articles" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.docs.map((article, i) => (
              <Card key={i} doc={article} relationTo="posts" showCategories className="h-full" />
            ))}
          </div>
        </section>
      )}

      {/* Latest Podcasts */}
      <section className="container mb-[var(--space-4xl)]">
        <SectionHeader title="Latest Podcasts" href="/podcasts" />
        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {episodes.map((ep, i) => (
              <PodcastEpisodeCard key={i} episode={ep} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {podcastFeedUrl
              ? 'No episodes found.'
              : 'Configure your podcast RSS feed in Site Settings.'}
          </p>
        )}
      </section>

      {/* Latest Videos */}
      <section className="container mb-[var(--space-4xl)]">
        <SectionHeader title="Latest Videos" href="/videos" />
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video, i) => (
              <YouTubeVideoCard key={i} video={video} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {youtubeChannelUrl
              ? 'No videos found.'
              : 'Configure your YouTube channel URL in Site Settings.'}
          </p>
        )}
      </section>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-[var(--space-xl)]">
      <h2
        className="font-bold"
        style={{
          fontSize: 'var(--font-size-2xl)',
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-heading)',
        }}
      >
        {title}
      </h2>
      <Link href={href} className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
        View all
      </Link>
    </div>
  )
}
