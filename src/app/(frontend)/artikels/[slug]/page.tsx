import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'

import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { formatDateTime } from '@/utilities/formatDateTime'
import { PatreonSection } from '@/components/sections/PatreonSection'
import { MoreContentSection } from '@/components/sections/MoreContentSection'
import { AuthorCard } from '@/components/(frontend)/AuthorCard'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return posts.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function ArticlePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/artikels/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article>
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="container max-w-4xl mx-auto">
        {post.heroImage && typeof post.heroImage !== 'number' && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Media resource={post.heroImage} />
          </div>
        )}

        <h1 className="mb-4">{post.title}</h1>

        <div className="flex flex-col gap-4 mb-12">
          {post.publishedAt && (
            <time className="text-sm text-c-foreground/50">{formatDateTime(post.publishedAt)}</time>
          )}
          {post.populatedAuthors && post.populatedAuthors.length > 0 && (
            <div className="flex flex-col gap-3">
              {post.populatedAuthors.map((author) => (
                <AuthorCard key={author.id} author={author} />
              ))}
            </div>
          )}
        </div>

        <RichText data={post.content} enableGutter={false} />
      </div>

      <PatreonSection />
      <MoreContentSection excludeSlug={slug} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
