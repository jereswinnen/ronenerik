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
    <section className="flex flex-col gap-12 md:gap-20 pt-6 md:pt-14">
      <section className="container flex flex-col gap-8 md:gap-14">
        {/* YouTube embed */}
        {matchedVideo && (
          <div className="aspect-video rounded-lg overflow-hidden">
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
        <article className="max-w-4xl mx-auto flex flex-col gap-12">
          <Breadcrumb parent={{ label: 'Podcast', href: '/podcast' }} title={episode.title}>
            <ShareIcons
              url={episodeUrl}
              title={episode.title}
              variant="podcast"
              youtubeUrl={matchedVideo ? `https://www.youtube.com/watch?v=${matchedVideo.videoId}` : youtubeChannelUrl}
              spotifyUrl={spotifyUrl}
            />
          </Breadcrumb>

          <div className="flex flex-col gap-6">
            <h2 className="leading-tight">{episode.title}</h2>
            {episode.description && (
              <div className="leading-relaxed whitespace-pre-line">{episode.description}</div>
            )}
          </div>
        </article>
      </section>

      <PatreonSection />
    </section>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl

  if (!feedUrl) return { title: 'Aflevering niet gevonden' }

  const episodes = await fetchPodcastEpisodes(feedUrl, 100)
  const episode = episodes.find((ep) => ep.slug === slug)

  if (!episode) return { title: 'Aflevering niet gevonden' }

  return {
    title: episode.title,
    description: episode.description,
  }
}
