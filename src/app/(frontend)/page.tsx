import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import Link from 'next/link'

import type { SiteSetting, Media as MediaType } from '@/payload-types'
import { Card } from '@/components/Card'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { fetchYouTubeVideos } from '@/utilities/rss/fetchYouTube'
import { PodcastEpisodeCard } from '@/components/PodcastEpisodeCard'
import { YouTubeVideoCard } from '@/components/YouTubeVideoCard'
import { PatreonSection } from '@/components/sections/PatreonSection'
import { AllContentLinks } from '@/components/sections/AllContentLinks'

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

  const [episodes, videos, episodeDocs] = await Promise.all([
    podcastFeedUrl ? fetchPodcastEpisodes(podcastFeedUrl, 4) : Promise.resolve([]),
    youtubeChannelUrl ? fetchYouTubeVideos(youtubeChannelUrl, 4) : Promise.resolve([]),
    payload.find({
      collection: 'podcast-episodes',
      limit: 20,
      depth: 1,
      select: { slug: true, featuredImage: true },
    }),
  ])

  // Build a map of slug → Payload media resource for quick lookup
  const defaultImage =
    typeof siteSettings?.podcast?.defaultEpisodeImage === 'object'
      ? siteSettings.podcast.defaultEpisodeImage
      : null
  const episodeImageMap = new Map<string, MediaType | null>()
  for (const doc of episodeDocs.docs) {
    const img =
      typeof doc.featuredImage === 'object' && doc.featuredImage
        ? doc.featuredImage
        : defaultImage
    episodeImageMap.set(doc.slug, img ?? null)
  }

  return (
    <div className="py-24">
      {/* Hero */}
      <section className="container mb-24">
        <h1 className="mb-4">
          {siteSettings?.general?.siteName || 'Welcome'}
        </h1>
        {siteSettings?.general?.tagline && (
          <p className="max-w-2xl text-xl text-c-foreground/60">
            {siteSettings.general.tagline}
          </p>
        )}
      </section>

      {/* Latest Articles */}
      {articles.docs.length > 0 && (
        <section className="container mb-24">
          <SectionHeader title="Latest Articles" href="/artikels" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.docs.map((article, i) => (
              <Card key={i} doc={article} relationTo="posts" showCategories className="h-full" />
            ))}
          </div>
        </section>
      )}

      {/* Latest Podcasts */}
      <section className="container mb-24">
        <SectionHeader title="Latest Podcasts" href="/podcast" />
        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {episodes.map((ep, i) => (
              <PodcastEpisodeCard key={i} episode={ep} image={episodeImageMap.get(ep.slug)} />
            ))}
          </div>
        ) : (
          <p className="text-c-foreground/60">
            {podcastFeedUrl
              ? 'No episodes found.'
              : 'Configure your podcast RSS feed in Site Settings.'}
          </p>
        )}
      </section>

      {/* Latest Videos */}
      <section className="container mb-24">
        <SectionHeader title="Latest Videos" href="/videos" />
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video, i) => (
              <YouTubeVideoCard key={i} video={video} />
            ))}
          </div>
        ) : (
          <p className="text-c-foreground/60">
            {youtubeChannelUrl
              ? 'No videos found.'
              : 'Configure your YouTube channel URL in Site Settings.'}
          </p>
        )}
      </section>

      {/* Patreon Section */}
      <PatreonSection />

      {/* All Content Links */}
      <AllContentLinks />
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2>{title}</h2>
      <Link href={href} className="text-sm font-medium text-c-accent">
        View all
      </Link>
    </div>
  )
}
