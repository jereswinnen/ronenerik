import type { Metadata } from 'next/types'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { ContentCard, formatUploadDate } from '@/components/(frontend)/ContentCard'
import { ContentGrid } from '@/components/(frontend)/ContentGrid'
import { PatreonSection } from '@/components/sections/PatreonSection'
import type { SiteSetting, Media as MediaType } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function PodcastPage() {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl

  const [episodes, episodeDocs] = await Promise.all([
    feedUrl ? fetchPodcastEpisodes(feedUrl) : Promise.resolve([]),
    payload.find({
      collection: 'podcast-episodes',
      limit: 100,
      depth: 1,
      select: { slug: true, featuredImage: true },
    }),
  ])

  const defaultImage =
    typeof siteSettings?.podcast?.defaultEpisodeImage === 'object'
      ? siteSettings.podcast.defaultEpisodeImage
      : null
  const imageMap = new Map<string, MediaType | null>()
  for (const doc of episodeDocs.docs) {
    const img =
      typeof doc.featuredImage === 'object' && doc.featuredImage ? doc.featuredImage : defaultImage
    imageMap.set(doc.slug, img ?? null)
  }

  return (
    <section className="pt-12 md:pt-30 flex flex-col gap-y-12 md:gap-y-30">
      <header className="container">
        <p className="uppercase text-sm italic text-c-foreground/50">De Ron en Erik Podcast</p>
        <h1>Elke maandag komen Ron en Erik in je oren</h1>
      </header>

      <section className="container flex flex-col gap-6">
        <h5>Alle podcasts</h5>
        <ContentGrid emptyMessage="Geen afleveringen gevonden.">
          {episodes.map((ep) => (
            <ContentCard
              key={ep.slug}
              href={`/podcast/${ep.slug}`}
              title={ep.title}
              image={imageMap.get(ep.slug)}
              imageSrc={ep.image}
              meta={ep.pubDate ? formatUploadDate(ep.pubDate) : undefined}
            />
          ))}
        </ContentGrid>
      </section>

      <PatreonSection />
    </section>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Podcast' }
}
