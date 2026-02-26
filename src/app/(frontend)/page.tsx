import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { Card } from '@/components/Card'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  const articles = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 6,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
  })

  return (
    <div className="py-[var(--space-4xl)]">
      {/* Hero */}
      <section className="container mb-[var(--space-4xl)]">
        <h1
          className="font-bold mb-[var(--space-md)]"
          style={{
            fontSize: 'var(--font-size-5xl)',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-heading)',
          }}
        >
          {siteSettings?.general?.siteName || 'Welcome'}
        </h1>
        {siteSettings?.general?.tagline && (
          <p
            className="max-w-2xl"
            style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-muted)' }}
          >
            {siteSettings.general.tagline}
          </p>
        )}
      </section>

      {/* Latest Articles */}
      {articles.docs.length > 0 && (
        <section className="container mb-[var(--space-4xl)]">
          <div className="flex items-center justify-between mb-[var(--space-xl)]">
            <h2
              className="font-bold"
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-heading)',
              }}
            >
              Latest Articles
            </h2>
            <Link
              href="/articles"
              className="text-sm font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.docs.map((article, i) => (
              <Card key={i} doc={article} relationTo="posts" showCategories className="h-full" />
            ))}
          </div>
        </section>
      )}

      {/* Latest Podcasts — placeholder, wired in Phase 4 */}
      <section className="container mb-[var(--space-4xl)]">
        <div className="flex items-center justify-between mb-[var(--space-xl)]">
          <h2
            className="font-bold"
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-heading)',
            }}
          >
            Latest Podcasts
          </h2>
          <Link
            href="/podcasts"
            className="text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            View all
          </Link>
        </div>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Podcast episodes will appear here once your RSS feed is configured in Site Settings.
        </p>
      </section>

      {/* Latest Videos — placeholder, wired in Phase 4 */}
      <section className="container mb-[var(--space-4xl)]">
        <div className="flex items-center justify-between mb-[var(--space-xl)]">
          <h2
            className="font-bold"
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-heading)',
            }}
          >
            Latest Videos
          </h2>
          <Link
            href="/videos"
            className="text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            View all
          </Link>
        </div>
        <p style={{ color: 'var(--color-text-muted)' }}>
          YouTube videos will appear here once your channel URL is configured in Site Settings.
        </p>
      </section>
    </div>
  )
}
