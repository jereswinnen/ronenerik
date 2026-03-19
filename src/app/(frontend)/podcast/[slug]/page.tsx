import type { Metadata } from 'next'
import React from 'react'
import { notFound } from 'next/navigation'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { fetchYouTubeVideos } from '@/utilities/rss/fetchYouTube'
import { matchEpisodeToVideo } from '@/utilities/rss/matchEpisodeToVideo'
import { PatreonSection } from '@/components/sections/PatreonSection'
import { MoreContentSection } from '@/components/sections/MoreContentSection'
import { Breadcrumb } from '@/components/(frontend)/Breadcrumb'
import { ShareIcons } from '@/components/(frontend)/ShareIcons'
import { getServerSideURL } from '@/utilities/getURL'
import type { SiteSetting } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 3600

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl
  if (!feedUrl) return []

  const episodes = await fetchPodcastEpisodes(feedUrl, 100)
  return episodes.map((ep) => ({ slug: ep.slug }))
}

export default async function PodcastEpisodePage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl
  const youtubeChannelUrl = siteSettings?.externalLinks?.youtubeChannelUrl

  if (!feedUrl) return notFound()

  const episodes = await fetchPodcastEpisodes(feedUrl, 100)
  const episode = episodes.find((ep) => ep.slug === slug)

  if (!episode) return notFound()

  // Try to match with a YouTube video
  const videos = youtubeChannelUrl ? await fetchYouTubeVideos(youtubeChannelUrl) : []
  const matchedVideo = matchEpisodeToVideo(episode, videos)

  const formattedDate = episode.pubDate
    ? new Date(episode.pubDate).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const episodeUrl = `${getServerSideURL()}/podcast/${slug}`
  const spotifyUrl = siteSettings?.externalLinks?.spotifyUrl

  return (
    <section className="flex flex-col gap-12 md:gap-20 pt-12 md:pt-30">
      <Breadcrumb parent={{ label: 'Podcast', href: '/podcast' }} title={episode.title}>
        <ShareIcons
          url={episodeUrl}
          title={episode.title}
          variant="podcast"
          youtubeUrl={youtubeChannelUrl}
          spotifyUrl={spotifyUrl}
        />
      </Breadcrumb>

      <article className="container max-w-4xl mx-auto">
        {/* YouTube embed */}
        {matchedVideo && (
          <div className="mb-8 aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${matchedVideo.videoId}`}
              title={matchedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Episode info */}
        <h1 className="mb-4">{episode.title}</h1>

        <div className="flex items-center gap-3 mb-8 text-sm text-c-foreground/60">
          {formattedDate && <time>{formattedDate}</time>}
          {formattedDate && episode.duration && <span>·</span>}
          {episode.duration && <span>{episode.duration}</span>}
        </div>

        {episode.description && (
          <div className="text-c-foreground/80 leading-relaxed whitespace-pre-line">
            {episode.description}
          </div>
        )}
      </article>

      <PatreonSection />
    </section>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl

  if (!feedUrl) return { title: 'Episode Not Found' }

  const episodes = await fetchPodcastEpisodes(feedUrl, 100)
  const episode = episodes.find((ep) => ep.slug === slug)

  if (!episode) return { title: 'Episode Not Found' }

  return {
    title: episode.title,
    description: episode.description,
  }
}
