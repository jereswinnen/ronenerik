import type { Payload } from 'payload'
import { fetchPodcastEpisodes } from './fetchPodcast'

/**
 * Syncs the latest podcast episodes from RSS into the podcast-episodes collection.
 * Creates new documents for episodes that don't exist yet (matched by slug).
 * Called by the daily cron at /api/revalidate-rss.
 */
export async function syncEpisodesToPayload(
  payload: Payload,
  feedUrl: string,
): Promise<{ created: number }> {
  const episodes = await fetchPodcastEpisodes(feedUrl, 20)

  if (episodes.length === 0) return { created: 0 }

  // Get all existing slugs in one query
  const existing = await payload.find({
    collection: 'podcast-episodes',
    limit: 100,
    select: { slug: true },
    pagination: false,
  })

  const existingSlugs = new Set(existing.docs.map((doc) => doc.slug))

  let created = 0

  for (const episode of episodes) {
    if (existingSlugs.has(episode.slug)) continue

    await payload.create({
      collection: 'podcast-episodes',
      data: {
        title: episode.title,
        slug: episode.slug,
      },
    })

    created++
  }

  return { created }
}
