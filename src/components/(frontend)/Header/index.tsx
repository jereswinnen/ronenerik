import { HeaderClient } from './HeaderClient'
import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { fetchPodcastEpisodes } from '@/utilities/rss/fetchPodcast'
import React from 'react'

import type { Header as HeaderType, SiteSetting, Media as MediaType } from '@/payload-types'

export async function Header() {
  const payload = await getPayload({ config: configPromise })
  const headerData = (await getCachedGlobal('header', 1)()) as HeaderType
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl

  const [episodes, latestArticle, episodeDocs] = await Promise.all([
    feedUrl ? fetchPodcastEpisodes(feedUrl, 1) : Promise.resolve([]),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 1,
      overrideAccess: false,
      sort: '-publishedAt',
      select: {
        title: true,
        slug: true,
        heroImage: true,
        meta: true,
        publishedAt: true,
        populatedAuthors: true,
      },
    }),
    payload.find({
      collection: 'podcast-episodes',
      limit: 1,
      depth: 1,
      sort: '-publishedAt',
      select: { slug: true, featuredImage: true },
    }),
  ])

  const latestEpisode = episodes[0] || null
  const latestPost = latestArticle.docs[0] || null

  // Resolve episode image
  const defaultImage =
    typeof siteSettings?.podcast?.defaultEpisodeImage === 'object'
      ? siteSettings.podcast.defaultEpisodeImage
      : null
  const episodeDoc = episodeDocs.docs[0]
  const episodeImage: MediaType | null = episodeDoc
    ? typeof episodeDoc.featuredImage === 'object' && episodeDoc.featuredImage
      ? episodeDoc.featuredImage
      : defaultImage
    : defaultImage

  // Article image — prefer meta image, fall back to heroImage
  const articleImage: MediaType | null =
    latestPost?.meta?.image && typeof latestPost.meta.image === 'object'
      ? latestPost.meta.image
      : latestPost?.heroImage && typeof latestPost.heroImage === 'object'
        ? latestPost.heroImage
        : null

  return (
    <HeaderClient
      data={headerData}
      siteSettings={siteSettings}
      latestEpisode={latestEpisode}
      episodeImage={episodeImage}
      latestArticle={latestPost ? {
        title: latestPost.title,
        slug: latestPost.slug!,
        image: articleImage,
        author: latestPost.populatedAuthors?.[0]?.name || null,
        publishedAt: latestPost.publishedAt || null,
      } : null}
    />
  )
}
