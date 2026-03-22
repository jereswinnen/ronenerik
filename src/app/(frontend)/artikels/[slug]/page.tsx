import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Tag } from '@/components/(frontend)/Tag'
import { PatreonSection } from '@/components/sections/PatreonSection'
import { MoreContentSection } from '@/components/sections/MoreContentSection'
import { AuthorCard } from '@/components/(frontend)/AuthorCard'
import { Breadcrumb } from '@/components/(frontend)/Breadcrumb'
import { ShareIcons } from '@/components/(frontend)/ShareIcons'
import { getServerSideURL } from '@/utilities/getURL'

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
    <section className="flex flex-col gap-12 px-4 md:px-0 md:gap-20 pt-12 md:pt-30">
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <Breadcrumb
        parent={{ label: 'Artikelen', href: '/artikels' }}
        title={post.title}
      ></Breadcrumb>

      <article className="max-w-2xl mx-auto flex flex-col gap-8 md:gap-14">
        <header className="flex flex-col gap-4">
          <h2 className="leading-tight">{post.title}</h2>
          {post.subtitle && <p className="text-lg text-c-foreground/60">{post.subtitle}</p>}

          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 text-c-accent">
              {post.categories.map((cat) => {
                if (!cat || typeof cat !== 'object') return null
                return <Tag key={cat.id} label={cat.title} />
              })}
            </div>
          )}
        </header>

        <RichText data={post.content} enableGutter={false} />
      </article>

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-12">
        <ShareIcons url={`${getServerSideURL()}${url}`} title={post.title} />
        <span className="w-full h-px bg-c-accent" />
        {post.populatedAuthors && post.populatedAuthors.length > 0 && (
          <div className="flex items-start gap-12">
            {post.rating && (
              <div className="relative flex items-center justify-center shrink-0">
                <img src="/RatingBadge.svg" alt="" className="w-30" />
                <span className="absolute -mt-7 flex items-end font-bold text-c-foreground leading-none">
                  <span className="text-7xl">
                    {post.rating.includes('.') ? post.rating.split('.')[0] : post.rating}
                  </span>
                  {post.rating.includes('.') && (
                    <span className="text-4xl -ml-3 mb-1">.{post.rating.split('.')[1]}</span>
                  )}
                </span>
              </div>
            )}

            {post.populatedAuthors.map((author) => (
              <AuthorCard key={author.id} author={author} />
            ))}
          </div>
        )}
      </div>

      <PatreonSection />
    </section>
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
