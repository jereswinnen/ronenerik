import React from 'react'
import type { PodcastEpisode } from '@/utilities/rss/types'

export const PodcastEpisodeCard: React.FC<{ episode: PodcastEpisode }> = ({ episode }) => {
  const formattedDate = episode.pubDate
    ? new Date(episode.pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <a
      href={episode.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 rounded-lg overflow-hidden border"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        transition: 'var(--transition-base)',
      }}
    >
      {episode.image && (
        <img
          src={episode.image}
          alt=""
          className="w-24 h-24 object-cover flex-shrink-0"
        />
      )}
      <div className="py-3 pr-4 flex flex-col justify-center min-w-0">
        <h3
          className="font-semibold line-clamp-2"
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-heading)',
          }}
        >
          {episode.title}
        </h3>
        <div
          className="flex items-center gap-2 mt-1"
          style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}
        >
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && episode.duration && <span>·</span>}
          {episode.duration && <span>{episode.duration}</span>}
        </div>
      </div>
    </a>
  )
}
