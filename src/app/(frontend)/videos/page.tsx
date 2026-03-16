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
    <div className="pt-24 pb-16">
      <header className="container mb-16">
        <p className="text-sm text-c-foreground/50 mb-4">Op YouTube</p>
        <h1>Bekijk de laatste video&apos;s</h1>
      </header>

      <section className="container mb-16">
        <h2 className="text-xl font-bold mb-8">Alle video&apos;s</h2>
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
    </div>
  )
}

export function generateMetadata(): Metadata {
  return { title: "Video's" }
}
