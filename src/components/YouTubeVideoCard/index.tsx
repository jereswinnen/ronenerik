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
      className="block rounded-lg overflow-hidden border group"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        transition: 'var(--transition-base)',
      }}
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3
          className="font-semibold line-clamp-2"
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-heading)',
          }}
        >
          {video.title}
        </h3>
        {formattedDate && (
          <p
            className="mt-1"
            style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
          >
            {formattedDate}
          </p>
        )}
      </div>
    </a>
  )
}
