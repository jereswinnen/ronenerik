import React from 'react'
import Link from 'next/link'
import type { PodcastEpisode } from '@/utilities/rss/types'
import type { Media as MediaType } from '@/payload-types'
import type { CardPostData } from '@/components/Card'
import { Media } from '@/components/Media'
import { Card } from '@/components/Card'

interface FeaturedSectionProps {
  episode: PodcastEpisode | null
  episodeImage?: MediaType | null
  articles: CardPostData[]
}

export function FeaturedSection({ episode, episodeImage, articles }: FeaturedSectionProps) {
  if (!episode && articles.length === 0) return null

  return (
    <section className="container mb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Podcast Episode */}
        {episode && (
          <Link
            href={`/podcast/${episode.slug}`}
            className="flex flex-col rounded-lg overflow-hidden border border-c-foreground/10 bg-c-foreground/5 transition-colors duration-200"
          >
            {episodeImage ? (
              <Media
                resource={episodeImage}
                imgClassName="w-full aspect-video object-cover"
                size="50vw"
              />
            ) : episode.image ? (
              <img
                src={episode.image}
                alt=""
                className="w-full aspect-video object-cover"
              />
            ) : null}
            <div className="p-5 flex flex-col flex-1">
              <span className="text-xs font-medium uppercase tracking-wider text-c-accent mb-2">
                Laatste aflevering
              </span>
              <h3 className="text-xl mb-2">{episode.title}</h3>
              {episode.description && (
                <p className="text-sm text-c-foreground/60 line-clamp-2">
                  {episode.description}
                </p>
              )}
            </div>
          </Link>
        )}

        {/* Latest Articles */}
        {articles.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-c-foreground/60">
                Laatste artikels
              </span>
              <Link href="/artikels" className="text-sm font-medium text-c-accent">
                Bekijk alle
              </Link>
            </div>
            {articles.map((article, i) => (
              <Card key={i} doc={article} relationTo="posts" showCategories />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
