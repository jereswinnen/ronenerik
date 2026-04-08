import React from 'react'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import {
  ContentCard,
  formatUploadDate,
  formatAuthor,
  isCommunityPost,
} from '@/components/(frontend)/ContentCard'
import type { SiteSetting, Media as MediaType } from '@/payload-types'

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
        heroImage: true,
        meta: true,
        authors: true,
        populatedAuthors: true,
        publishedAt: true,
      },
    }),
    feedUrl ? fetchPodcastEpisodes(feedUrl, 4) : Promise.resolve([]),
  ])

  const filteredArticles = excludeSlug
    ? articles.docs.filter((doc) => doc.slug !== excludeSlug)
    : articles.docs

  const filteredEpisodes = excludeSlug ? episodes.filter((ep) => ep.slug !== excludeSlug) : episodes

  return (
    <section className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {filteredEpisodes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Meer afleveringen</h2>
              <Link href="/podcast" className="text-sm text-c-accent">
                Bekijk alle
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {filteredEpisodes.slice(0, 3).map((ep) => (
                <ContentCard
                  key={ep.slug}
                  href={`/podcast/${ep.slug}`}
                  title={ep.title}
                  imageSrc={ep.image}
                  meta={ep.pubDate ? formatUploadDate(ep.pubDate) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {filteredArticles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Meer artikelen</h2>
              <Link href="/artikels" className="text-sm text-c-accent">
                Bekijk alle
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {filteredArticles.slice(0, 3).map((article) => {
                const metaImage: MediaType | null =
                  article.meta?.image && typeof article.meta.image === 'object'
                    ? article.meta.image
                    : article.heroImage && typeof article.heroImage === 'object'
                      ? article.heroImage
                      : null
                const author = article.populatedAuthors?.[0]?.name
                const community = isCommunityPost(article.populatedAuthors)
                return (
                  <ContentCard
                    key={article.slug}
                    href={`/artikels/${article.slug}`}
                    title={article.title}
                    image={metaImage}
                    meta={author ? formatAuthor(author) : undefined}
                    tag={community ? 'Uit de community' : undefined}
                    excerpt={community ? (article.meta?.description || undefined) : undefined}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
