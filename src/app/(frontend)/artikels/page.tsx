import type { Metadata } from 'next/types'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ContentCard, formatAuthor, isCommunityPost } from '@/components/(frontend)/ContentCard'
import { ContentGrid } from '@/components/(frontend)/ContentGrid'
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
  })

  return (
    <section className="pt-12 md:pt-30 flex flex-col gap-y-12 md:gap-y-30">
      <header className="container">
        <p className="uppercase text-sm italic text-c-foreground/50">Leesvoer</p>
        <h1>Elke maandag komen Ron en Erik in je oren</h1>
      </header>

      <section className="container flex flex-col gap-6">
        <h5>Alle artikelen</h5>
        <ContentGrid emptyMessage="Geen artikelen gevonden.">
          {posts.docs.map((post) => {
            const articleImage =
              post.meta?.image && typeof post.meta.image === 'object'
                ? (post.meta.image as MediaType)
                : post.heroImage && typeof post.heroImage === 'object'
                  ? (post.heroImage as MediaType)
                  : null
            const author = post.populatedAuthors?.[0]?.name

            const community = isCommunityPost(post.populatedAuthors)
            return (
              <ContentCard
                key={post.slug}
                href={`/artikels/${post.slug}`}
                title={post.title}
                image={articleImage}
                meta={author ? formatAuthor(author) : undefined}
                tag={community ? 'Uit de community' : undefined}
                excerpt={community ? (post.meta?.description || undefined) : undefined}
              />
            )
          })}
        </ContentGrid>
      </section>

      <PatreonSection />
    </section>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Artikelen' }
}
