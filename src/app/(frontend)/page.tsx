import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { SiteSetting, Media as MediaType } from '@/payload-types'
import { ContentCard, formatUploadDate, formatAuthor } from '@/components/(frontend)/ContentCard'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { fetchYouTubeVideos } from '@/utilities/rss/fetchYouTube'
import { matchEpisodeToVideo } from '@/utilities/rss/matchEpisodeToVideo'
import { PatreonSection } from '@/components/sections/PatreonSection'
import { AllContentLinks } from '@/components/sections/AllContentLinks'
import { FeaturedSection } from '@/components/sections/FeaturedSection'
import { SocialsSection } from '@/components/sections/SocialsSection'
import { AboutSection } from '@/components/sections/AboutSection'

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
        meta: true,
        publishedAt: true,
        populatedAuthors: true,
      },
    }),
    podcastFeedUrl ? fetchPodcastEpisodes(podcastFeedUrl, 5) : Promise.resolve([]),
    youtubeChannelUrl ? fetchYouTubeVideos(youtubeChannelUrl) : Promise.resolve([]),
    payload.find({
      collection: 'podcast-episodes',
      limit: 20,
      depth: 1,
      select: { slug: true, featuredImage: true },
    }),
  ])

  const defaultImage =
    typeof siteSettings?.podcast?.defaultEpisodeImage === 'object'
      ? siteSettings.podcast.defaultEpisodeImage
      : null
  const episodeImageMap = new Map<string, MediaType | null>()
  for (const doc of episodeDocs.docs) {
    const img =
      typeof doc.featuredImage === 'object' && doc.featuredImage ? doc.featuredImage : defaultImage
    episodeImageMap.set(doc.slug, img ?? null)
  }

  const latestEpisode = episodes[0] || null
  const matchedVideo = latestEpisode ? matchEpisodeToVideo(latestEpisode, videos) : null

  // Build a unified list of recent content (podcasts + articles), sorted by date, max 4
  type RecentItem = {
    type: 'podcast' | 'artikel'
    href: string
    title: string
    image?: MediaType | null
    imageSrc?: string | null
    meta?: string
    date: Date
  }

  const recentItems: RecentItem[] = []

  // Add podcast episodes (skip the featured one)
  for (const ep of episodes.slice(1)) {
    recentItems.push({
      type: 'podcast',
      href: `/podcast/${ep.slug}`,
      title: ep.title,
      image: episodeImageMap.get(ep.slug),
      imageSrc: ep.image,
      meta: ep.pubDate ? formatUploadDate(ep.pubDate) : undefined,
      date: ep.pubDate ? new Date(ep.pubDate) : new Date(0),
    })
  }

  // Add articles
  for (const article of articles.docs) {
    const metaImage: MediaType | null =
      article.meta && typeof article.meta.image === 'object' ? article.meta.image : null
    const author = article.populatedAuthors?.[0]?.name
    recentItems.push({
      type: 'artikel',
      href: `/artikels/${article.slug}`,
      title: article.title,
      image: metaImage,
      meta: author ? formatAuthor(author) : undefined,
      date: article.publishedAt ? new Date(article.publishedAt) : new Date(0),
    })
  }

  // Sort by date descending and take 4
  recentItems.sort((a, b) => b.date.getTime() - a.date.getTime())
  const recentContent = recentItems.slice(0, 4)

  return (
    <>
      {latestEpisode && (
        <FeaturedSection
          episode={latestEpisode}
          episodeImage={episodeImageMap.get(latestEpisode.slug)}
          matchedVideo={matchedVideo}
        />
      )}

      <SocialsSection />

      {recentContent.length > 0 && (
        <section className="container flex flex-col gap-8">
          <h5>Recente content</h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* First item: large featured card */}
            {recentContent[0] && (
              <ContentCard
                href={recentContent[0].href}
                title={recentContent[0].title}
                image={recentContent[0].image}
                imageSrc={recentContent[0].imageSrc}
                meta={recentContent[0].meta}
                tag={recentContent[0].type === 'podcast' ? 'Podcast' : 'Artikel'}
                podcastCorners={recentContent[0].type === 'podcast'}
                isLarge={true}
              />
            )}

            {/* Remaining items: horizontal cards stacked */}
            <div className="flex flex-col gap-6">
              {recentContent.slice(1).map((item) => (
                <ContentCard
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  image={item.image}
                  imageSrc={item.imageSrc}
                  meta={item.meta}
                  tag={item.type === 'podcast' ? 'Podcast' : 'Artikel'}
                  horizontal
                  podcastCorners={item.type === 'podcast'}
                  isLarge={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <PatreonSection />
      <AboutSection />
      <AllContentLinks />
    </>
  )
}
