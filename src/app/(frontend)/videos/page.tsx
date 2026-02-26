import type { Metadata } from 'next/types'
import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchYouTubeVideos } from '@/utilities/rss/fetchYouTube'
import { YouTubeVideoCard } from '@/components/YouTubeVideoCard'
import type { SiteSetting } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function VideosPage() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const channelUrl = siteSettings?.externalLinks?.youtubeChannelUrl

  const videos = channelUrl ? await fetchYouTubeVideos(channelUrl) : []

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
          Videos
        </h1>
      </div>

      <div className="container">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <YouTubeVideoCard key={i} video={video} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {channelUrl
              ? 'No videos found.'
              : 'Configure your YouTube channel URL in Site Settings.'}
          </p>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Videos',
  }
}
