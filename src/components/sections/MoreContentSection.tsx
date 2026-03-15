import React from 'react'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import { PodcastEpisodeCard } from '@/components/PodcastEpisodeCard'
import { Card } from '@/components/Card'
import type { SiteSetting } from '@/payload-types'

interface MoreContentSectionProps {
  excludeSlug?: string
}

export async function MoreContentSection({ excludeSlug }: MoreContentSectionProps) {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl

  const [articles, episodes] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 4,
      overrideAccess: false,
      sort: '-publishedAt',
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
      },
    }),
    feedUrl ? fetchPodcastEpisodes(feedUrl, 4) : Promise.resolve([]),
  ])

  const filteredArticles = excludeSlug
    ? articles.docs.filter((doc) => doc.slug !== excludeSlug)
    : articles.docs

  const filteredEpisodes = excludeSlug
    ? episodes.filter((ep) => ep.slug !== excludeSlug)
    : episodes

  return (
    <section className="container py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* More Episodes */}
        {filteredEpisodes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">More Episodes</h2>
              <Link href="/podcast" className="text-sm text-c-accent">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {filteredEpisodes.slice(0, 3).map((ep, i) => (
                <PodcastEpisodeCard key={i} episode={ep} />
              ))}
            </div>
          </div>
        )}

        {/* More Articles */}
        {filteredArticles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">More Articles</h2>
              <Link href="/artikels" className="text-sm text-c-accent">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {filteredArticles.slice(0, 3).map((article, i) => (
                <Card key={i} doc={article} relationTo="posts" showCategories />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
