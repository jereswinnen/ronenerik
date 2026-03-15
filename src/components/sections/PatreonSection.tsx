import React from 'react'
import Link from 'next/link'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { PodcastEpisodeCard } from '@/components/PodcastEpisodeCard'
import type { SiteSetting } from '@/payload-types'

export async function PatreonSection() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const patreonUrl = siteSettings?.externalLinks?.patreonUrl
  const patreonFeedUrl = siteSettings?.patreon?.patreonPodcastFeedUrl
  const heading = siteSettings?.patreon?.heading || 'De extra podcast van deze week'
  const description = siteSettings?.patreon?.description
  const ctaText = siteSettings?.patreon?.ctaText || 'Steun de show'

  const episodes = patreonFeedUrl ? await fetchPodcastEpisodes(patreonFeedUrl, 1) : []
  const latestEpisode = episodes[0] || null

  return (
    <section className="container py-16">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Left: heading + CTA */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <PatreonIcon />
            <h2>{heading}</h2>
          </div>
          {description && (
            <p className="text-c-foreground/60 mb-6">{description}</p>
          )}
          {patreonUrl && (
            <Link
              href={patreonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-c-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {ctaText}
            </Link>
          )}
        </div>

        {/* Right: latest Patreon episode */}
        {latestEpisode && (
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <PodcastEpisodeCard episode={latestEpisode} />
          </div>
        )}
      </div>
    </section>
  )
}

function PatreonIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-c-foreground/80 flex-shrink-0"
    >
      <path d="M14.82 2.41c3.96 0 7.18 3.24 7.18 7.21 0 3.96-3.22 7.18-7.18 7.18-3.97 0-7.21-3.22-7.21-7.18 0-3.97 3.24-7.21 7.21-7.21M2 21.6h3.5V2.41H2V21.6z" />
    </svg>
  )
}
