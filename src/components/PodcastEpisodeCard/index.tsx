import React from 'react'
import Link from 'next/link'
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
    <Link
      href={`/podcast/${episode.slug}`}
      className="flex gap-4 rounded-lg overflow-hidden border border-c-foreground/10 bg-c-foreground/5 transition-colors duration-200"
    >
      {episode.image && (
        <img
          src={episode.image}
          alt=""
          className="w-24 h-24 object-cover flex-shrink-0"
        />
      )}
      <div className="py-3 pr-4 flex flex-col justify-center min-w-0">
        <h3 className="text-base line-clamp-2">
          {episode.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-c-foreground/60">
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && episode.duration && <span>·</span>}
          {episode.duration && <span>{episode.duration}</span>}
        </div>
      </div>
    </Link>
  )
}
