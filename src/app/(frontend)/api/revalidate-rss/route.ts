import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

/**
 * On-demand revalidation for RSS-dependent pages.
 * Called by the Vercel cron (vercel.json) daily at 06:00 CET.
 *
 * Revalidates all pages that display content from external RSS feeds:
 * - Podcast episodes (main feed)
 * - YouTube videos
 * - Patreon-exclusive episodes
 *
 * Protected by CRON_SECRET to prevent unauthorized calls.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // All pages that render RSS feed content
  revalidatePath('/')
  revalidatePath('/podcast')
  revalidatePath('/patreon')
  revalidatePath('/videos')

  return Response.json({ revalidated: true })
}
