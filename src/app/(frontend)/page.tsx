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
import { FeaturedSection } from '@/components/sections/FeaturedSection'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  const podcastFeedUrl = siteSettings?.externalLinks?.podcastFeedUrl
  const youtubeChannelUrl = siteSettings?.externalLinks?.youtubeChannelUrl

  const [articles, episodes, videos, episodeDocs] = await Promise.all([
    payload.find({
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
    }),
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

  // Featured section: latest episode + first 4 articles
  const latestEpisode = episodes[0] || null
  const featuredArticles = articles.docs.slice(0, 4)
  // Remaining content for the sections below
  const remainingEpisodes = episodes.slice(1)
  const remainingArticles = articles.docs.slice(4)

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

      {/* Featured: latest episode + latest articles */}
      <FeaturedSection
        episode={latestEpisode}
        episodeImage={latestEpisode ? episodeImageMap.get(latestEpisode.slug) : null}
        articles={featuredArticles}
      />

      {/* More Podcasts */}
      {remainingEpisodes.length > 0 && (
        <section className="container mb-24">
          <SectionHeader title="Meer afleveringen" href="/podcast" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {remainingEpisodes.map((ep, i) => (
              <PodcastEpisodeCard key={i} episode={ep} image={episodeImageMap.get(ep.slug)} />
            ))}
          </div>
        </section>
      )}

      {/* More Articles */}
      {remainingArticles.length > 0 && (
        <section className="container mb-24">
          <SectionHeader title="Meer artikels" href="/artikels" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingArticles.map((article, i) => (
              <Card key={i} doc={article} relationTo="posts" showCategories className="h-full" />
            ))}
          </div>
        </section>
      )}

      {/* Latest Videos */}
      <section className="container mb-24">
        <SectionHeader title="Laatste video's" href="/videos" />
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
        Bekijk alle
      </Link>
    </div>
  )
}
