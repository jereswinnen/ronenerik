import type { Metadata } from 'next/types'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ContentCard, formatAuthor } from '@/components/(frontend)/ContentCard'
import { PatreonSection } from '@/components/sections/PatreonSection'
import type { Media as MediaType } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function ArticlesPage() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      meta: true,
      populatedAuthors: true,
    },
  })

  return (
    <div className="pt-24 pb-16">
      <header className="container mb-16">
        <p className="text-sm text-c-foreground/50 mb-4">Leesvoer</p>
        <h1>Elke maandag komen Ron en Erik in je oren</h1>
      </header>

      <section className="container mb-16">
        <h2 className="text-xl font-bold mb-8">Alle artikelen</h2>
        {posts.docs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.docs.map((post) => {
              const metaImage: MediaType | null =
                post.meta && typeof post.meta.image === 'object' ? post.meta.image : null
              const author = post.populatedAuthors?.[0]?.name

              return (
                <ContentCard
                  key={post.slug}
                  href={`/artikels/${post.slug}`}
                  title={post.title}
                  image={metaImage}
                  meta={author ? formatAuthor(author) : undefined}
                />
              )
            })}
          </div>
        ) : (
          <p className="text-c-foreground/60">Geen artikelen gevonden.</p>
        )}
      </section>

      <PatreonSection />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Artikelen' }
}
