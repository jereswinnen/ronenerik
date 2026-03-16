import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import Link from 'next/link'

import type { SiteSetting, Media as MediaType } from '@/payload-types'
import { ContentCard, formatUploadDate, formatAuthor, youtubeMaxRes } from '@/components/(frontend)/ContentCard'
import { ContentGrid } from '@/components/(frontend)/ContentGrid'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { fetchYouTubeVideos } from '@/utilities/rss/fetchYouTube'
import { matchEpisodeToVideo } from '@/utilities/rss/matchEpisodeToVideo'
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
        meta: true,
        publishedAt: true,
        populatedAuthors: true,
      },
    }),
    podcastFeedUrl ? fetchPodcastEpisodes(podcastFeedUrl, 4) : Promise.resolve([]),
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
      typeof doc.featuredImage === 'object' && doc.featuredImage
        ? doc.featuredImage
        : defaultImage
    episodeImageMap.set(doc.slug, img ?? null)
  }

  const latestEpisode = episodes[0] || null
  const matchedVideo = latestEpisode ? matchEpisodeToVideo(latestEpisode, videos) : null
  const remainingEpisodes = episodes.slice(1)

  return (
    <div>
      {latestEpisode && (
        <FeaturedSection
          episode={latestEpisode}
          episodeImage={episodeImageMap.get(latestEpisode.slug)}
          matchedVideo={matchedVideo}
        />
      )}

      {remainingEpisodes.length > 0 && (
        <section className="container mb-24">
          <SectionHeader title="Meer afleveringen" href="/podcast" />
          <ContentGrid>
            {remainingEpisodes.map((ep) => (
              <ContentCard
                key={ep.slug}
                href={`/podcast/${ep.slug}`}
                title={ep.title}
                image={episodeImageMap.get(ep.slug)}
                imageSrc={ep.image}
                meta={ep.pubDate ? formatUploadDate(ep.pubDate) : undefined}
              />
            ))}
          </ContentGrid>
        </section>
      )}

      {articles.docs.length > 0 && (
        <section className="container mb-24">
          <SectionHeader title="Laatste artikels" href="/artikels" />
          <ContentGrid>
            {articles.docs.map((article) => {
              const metaImage: MediaType | null =
                article.meta && typeof article.meta.image === 'object' ? article.meta.image : null
              const author = article.populatedAuthors?.[0]?.name
              return (
                <ContentCard
                  key={article.slug}
                  href={`/artikels/${article.slug}`}
                  title={article.title}
                  image={metaImage}
                  meta={author ? formatAuthor(author) : undefined}
                />
              )
            })}
          </ContentGrid>
        </section>
      )}

      {videos.length > 0 && (
        <section className="container mb-24">
          <SectionHeader title="Laatste video's" href="/videos" />
          <ContentGrid>
            {videos.slice(0, 4).map((video) => (
              <ContentCard
                key={video.videoId}
                href={video.link}
                title={video.title}
                imageSrc={youtubeMaxRes(video.videoId)}
                meta={video.pubDate ? formatUploadDate(video.pubDate) : undefined}
              />
            ))}
          </ContentGrid>
        </section>
      )}

      <PatreonSection />
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
