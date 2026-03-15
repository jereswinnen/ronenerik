import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { syncEpisodesToPayload } from '@/utilities/rss/syncEpisodesToPayload'

/**
 * On-demand revalidation for RSS-dependent pages.
 * Called by the Vercel cron (vercel.json) daily at 06:00 CET.
 *
 * 1. Syncs latest 20 podcast episodes from RSS into Payload (creates missing docs)
 * 2. Revalidates all pages that display RSS feed content
 *
 * Protected by CRON_SECRET to prevent unauthorized calls.
 */
export async function GET(request: NextRequest) {
  // In production, require CRON_SECRET. In dev, allow unauthenticated access.
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const payload = await getPayload({ config: configPromise })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
  const feedUrl = siteSettings?.externalLinks?.podcastFeedUrl

  // Sync podcast episodes from RSS → Payload
  let syncResult = { created: 0 }
  if (feedUrl) {
    syncResult = await syncEpisodesToPayload(payload, feedUrl)
  }

  // Revalidate all RSS-dependent pages
  revalidatePath('/')
  revalidatePath('/podcast')
  revalidatePath('/patreon')
  revalidatePath('/videos')

  return Response.json({ revalidated: true, episodesCreated: syncResult.created })
}
