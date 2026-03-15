import React from 'react'
import Link from 'next/link'
import type { PodcastEpisode, YouTubeVideo } from '@/utilities/rss/types'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

interface FeaturedSectionProps {
  episode: PodcastEpisode
  episodeImage?: MediaType | null
  matchedVideo?: YouTubeVideo | null
}

export function FeaturedSection({ episode, episodeImage, matchedVideo }: FeaturedSectionProps) {
  return (
    <section className="-mt-20">
      <Link href={`/podcast/${episode.slug}`} className="block relative">
        {/* Hero image — full bleed, behind nav */}
        <figure className="w-full aspect-[16/8] sm:aspect-[16/7] lg:aspect-[16/6] overflow-hidden">
          {episodeImage ? (
            <Media resource={episodeImage} imgClassName="w-full h-full object-cover" size="100vw" />
          ) : episode.image ? (
            <img src={episode.image} alt="" className="w-full h-full object-cover" />
          ) : null}
        </figure>

        {/* YouTube thumbnail — overlaps bottom of image, container-aligned */}
        {matchedVideo && (
          <div className="absolute bottom-0 inset-x-0 translate-y-1/2">
            <div className="container flex justify-end">
              <img
                src={`https://i.ytimg.com/vi/${matchedVideo.videoId}/maxresdefault.jpg`}
                alt={matchedVideo.title}
                className="w-80 rounded-lg border-[3px] border-c-accent shadow-2xl"
              />
            </div>
          </div>
        )}
      </Link>

      {/* Episode details */}
      <div className={`container ${matchedVideo ? 'pt-24' : 'pt-12'} pb-20`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <header className="flex flex-col gap-4">
            <p className="text-sm text-c-foreground/50">De laatste Ron en Erik</p>
            <h1 className="leading-tight">{episode.title}</h1>
          </header>
          {episode.description && (
            <p className="text-c-foreground/70 leading-relaxed lg:pt-10">{episode.description}</p>
          )}
        </div>
      </div>
    </section>
  )
}
