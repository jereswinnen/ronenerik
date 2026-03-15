import React from 'react'
import Link from 'next/link'
import type { PodcastEpisode } from '@/utilities/rss/types'

interface PodcastEpisodeCardProps {
  episode: PodcastEpisode
  /** Overrides the RSS image (e.g. Payload featured image or default image URL) */
  imageOverride?: string | null
}

export const PodcastEpisodeCard: React.FC<PodcastEpisodeCardProps> = ({
  episode,
  imageOverride,
}) => {
  const formattedDate = episode.pubDate
    ? new Date(episode.pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const imageSrc = imageOverride || episode.image

  return (
    <Link
      href={`/podcast/${episode.slug}`}
      className="flex gap-4 rounded-lg overflow-hidden border border-c-foreground/10 bg-c-foreground/5 transition-colors duration-200"
    >
      {imageSrc && (
        <img
          src={imageSrc}
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
