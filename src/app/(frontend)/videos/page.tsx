import type { Metadata } from 'next/types'
import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchYouTubeVideos } from '@/utilities/rss/fetchYouTube'
import { ContentCard, formatUploadDate, youtubeMaxRes } from '@/components/(frontend)/ContentCard'
import { ContentGrid } from '@/components/(frontend)/ContentGrid'
import type { SiteSetting } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function VideosPage() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const channelUrl = siteSettings?.externalLinks?.youtubeChannelUrl

  const videos = channelUrl ? await fetchYouTubeVideos(channelUrl) : []

  return (
    <section className="pt-12 md:pt-30 flex flex-col gap-y-12 md:gap-y-30">
      <header className="container">
        <p className="uppercase text-sm italic text-c-foreground/50">Kijkplezier</p>
        <h1>Elke maandag komen Ron en Erik in je oren</h1>
      </header>

      <section className="container flex flex-col gap-6">
        <h5>Alle video&apos;s</h5>
        <ContentGrid emptyMessage="Geen video's gevonden.">
          {videos.map((video) => (
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
    </section>
  )
}

export function generateMetadata(): Metadata {
  return { title: "Video's" }
}
