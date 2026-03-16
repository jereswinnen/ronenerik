import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { ContentCard, formatAuthor } from '@/components/(frontend)/ContentCard'
import { ContentGrid } from '@/components/(frontend)/ContentGrid'
import { Pagination } from '@/components/Pagination'
import type { Media as MediaType } from '@/payload-types'

export const revalidate = 600

type Args = {
  params: Promise<{ pageNumber: string }>
}

export default async function ArticlesPageNumber({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
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
    <>
      <div className="container mb-12">
        <h1>Artikelen</h1>
      </div>

      <section className="container mb-16">
        <ContentGrid emptyMessage="Geen artikelen gevonden.">
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
        </ContentGrid>
      </section>

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return { title: `Artikelen — Pagina ${pageNumber || ''}` }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 12)
  const pages: { pageNumber: string }[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }
  return pages
}
