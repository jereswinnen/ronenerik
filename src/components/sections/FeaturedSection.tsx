import React from 'react'
import Link from 'next/link'
import type { PodcastEpisode, YouTubeVideo } from '@/utilities/rss/types'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { Parallax } from './Parallax'

interface FeaturedSectionProps {
  episode: PodcastEpisode
  episodeImage?: MediaType | null
  matchedVideo?: YouTubeVideo | null
}

export function FeaturedSection({ episode, episodeImage, matchedVideo }: FeaturedSectionProps) {
  return (
    <section className="-mt-20">
      <Link href={`/podcast/${episode.slug}`} className="block relative">
        {/* Hero image — full bleed, behind nav, with parallax */}
        <Parallax>
          <figure className="w-full h-[40vh] sm:h-[50vh] lg:h-[60vh]">
            {episodeImage ? (
              <Media
                resource={episodeImage}
                className="h-full"
                imgClassName="w-full h-full object-cover"
                size="100vw"
                priority
              />
            ) : episode.image ? (
              <img src={episode.image} alt="" className="w-full h-full object-cover" />
            ) : null}
          </figure>
        </Parallax>

        {/* YouTube thumbnail — overlaps bottom of image, container-aligned */}
        {matchedVideo && (
          <div className="absolute bottom-0 inset-x-0 translate-y-1/2">
            <div className="container flex justify-end">
              <div className="group relative w-40 sm:w-56 md:w-64 lg:w-80">
                <img
                  src={`https://i.ytimg.com/vi/${matchedVideo.videoId}/maxresdefault.jpg`}
                  alt={matchedVideo.title}
                  className="w-full rounded-lg border-[3px] border-c-accent shadow-2xl"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-10 sm:size-12 md:size-14 lg:size-16 bg-c-accent rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-115">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="size-5 sm:size-6 md:size-7 lg:size-8 ml-0.5"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Link>

      {/* Episode details */}
      <div className={`container ${matchedVideo ? 'pt-8 sm:pt-16 lg:pt-24' : 'pt-8 sm:pt-12'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <header className="flex flex-col gap-2">
            <p>De laatste Ron en Erik</p>
            <h1 className="leading-tight">{episode.title}</h1>
          </header>
          {episode.description && <p className="leading-relaxed lg:pt-10">{episode.description}</p>}
        </div>
      </div>
    </section>
  )
}
