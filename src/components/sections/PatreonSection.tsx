import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { ContentCard, formatUploadDate } from '@/components/(frontend)/ContentCard'
import { Button } from '@/components/(frontend)/Button'
import type { SiteSetting } from '@/payload-types'
import IconPatreon from '../../../public/IconPatreonSmall.svg'
import IconPatreonLarge from '../../../public/IconPatreonLarge.svg'

export async function PatreonSection() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const patreonUrl = siteSettings?.externalLinks?.patreonUrl
  const patreonFeedUrl = siteSettings?.patreon?.patreonPodcastFeedUrl
  const heading = siteSettings?.patreon?.heading || 'De extra podcast van deze week'
  const ctaText = siteSettings?.patreon?.ctaText || 'Steun de show'

  const episodes = patreonFeedUrl ? await fetchPodcastEpisodes(patreonFeedUrl, 1) : []
  const latestEpisode = episodes[0] || null

  return (
    <section className="bg-c-muted py-12 md:py-30">
      <div className="container flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
        <div className="flex flex-col gap-8 flex-1 min-w-0">
          <div className="flex flex-col gap-3">
            <IconPatreonLarge className="h-8 w-auto shrink-0" />
            <h2 className="leading-tight">{heading}</h2>
          </div>
          <Button className="w-fit" href="/patreon" external>
            {ctaText}
          </Button>
        </div>

        {latestEpisode && (
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <ContentCard
              href="/patreon"
              title={latestEpisode.title}
              imageSrc={latestEpisode.image}
              meta={latestEpisode.pubDate ? formatUploadDate(latestEpisode.pubDate) : undefined}
              horizontal
              isLarge
            />
          </div>
        )}
      </div>
    </section>
  )
}
