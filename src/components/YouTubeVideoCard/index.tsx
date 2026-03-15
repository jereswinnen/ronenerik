import React from 'react'
import type { YouTubeVideo } from '@/utilities/rss/types'

export const YouTubeVideoCard: React.FC<{ video: YouTubeVideo }> = ({ video }) => {
  const formattedDate = video.pubDate
    ? new Date(video.pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <a
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg overflow-hidden border border-c-foreground/10 bg-c-foreground/5 transition-colors duration-200 group"
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2">
          {video.title}
        </h3>
        {formattedDate && (
          <p className="mt-1 text-xs text-c-foreground/60">
            {formattedDate}
          </p>
        )}
      </div>
    </a>
  )
}
