import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { ContentCard, formatAuthor } from '@/components/(frontend)/ContentCard'
import type { SiteSetting, Media as MediaType } from '@/payload-types'
import { Button } from '../(frontend)/Button'
import IconDiscordLarge from '../../../public/IconDiscordLarge.svg'

export async function CommunitySection() {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const discordUrl = siteSettings?.externalLinks?.discordUrl

  // Find the latest published post authored by a guest user
  const guestUsers = await payload.find({
    collection: 'users',
    where: { role: { equals: 'guest' } },
    limit: 100,
    select: { role: true },
  })

  if (guestUsers.docs.length === 0) return null

  const guestIds = guestUsers.docs.map((u) => u.id)

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      authors: { in: guestIds.join(',') },
    },
    select: {
      title: true,
      slug: true,
      heroImage: true,
      meta: true,
      publishedAt: true,
      populatedAuthors: true,
    },
  })

  const latestPost = posts.docs[0]
  if (!latestPost) return null

  const postImage: MediaType | null =
    latestPost.meta?.image && typeof latestPost.meta.image === 'object'
      ? latestPost.meta.image
      : latestPost.heroImage && typeof latestPost.heroImage === 'object'
        ? (latestPost.heroImage as MediaType)
        : null

  const author = latestPost.populatedAuthors?.[0]?.name
  const excerpt = latestPost.meta?.description || undefined

  return (
    <section className="container flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
      <div className="order-1 lg:order-0 flex-1 min-w-0 w-full lg:w-auto">
        <ContentCard
          href={`/artikels/${latestPost.slug}`}
          title={latestPost.title}
          image={postImage}
          meta={author ? formatAuthor(author) : undefined}
          excerpt={excerpt}
          tag="Uit de community"
          horizontal
          isLarge
        />
      </div>

      <div className="order-0 lg:order-1 flex flex-col gap-8 flex-1 min-w-0">
        <div className="flex flex-col gap-3">
          <IconDiscordLarge className="h-8 w-auto shrink-0" />
          <h2 className="leading-tight">De leukste community met de leukste artikelen</h2>
        </div>
        {discordUrl && (
          <Button
            className="w-fit text-c-accent! bg-c-accent-background! hover:text-white! hover:bg-c-accent!"
            href={discordUrl}
            variant="secondary"
          >
            Join de community
          </Button>
        )}
      </div>
    </section>
  )
}
