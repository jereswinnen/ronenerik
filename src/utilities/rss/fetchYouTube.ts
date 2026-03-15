import type { YouTubeVideo } from './types'

/**
 * Fetches latest videos from a YouTube channel via its RSS feed.
 * Caching is controlled at the page level — pages set `export const revalidate`
 * and the Vercel cron (`/api/revalidate-rss`) triggers on-demand revalidation.
 *
 * Accepts either:
 * - A full channel URL (https://youtube.com/@handle or https://youtube.com/channel/UC...)
 * - A direct RSS feed URL
 */
export async function fetchYouTubeVideos(
  channelUrl: string,
  limit = 15,
): Promise<YouTubeVideo[]> {
  try {
    const feedUrl = await resolveYouTubeFeedUrl(channelUrl)

    if (!feedUrl) {
      console.error('Could not resolve YouTube feed URL from:', channelUrl)
      return []
    }

    const res = await fetch(feedUrl)

    if (!res.ok) {
      console.error(`Failed to fetch YouTube feed: ${res.status}`)
      return []
    }

    const xml = await res.text()
    return parseYouTubeXml(xml, limit)
  } catch (error) {
    console.error('Error fetching YouTube feed:', error)
    return []
  }
}

async function resolveYouTubeFeedUrl(url: string): Promise<string | null> {
  // Already an RSS feed URL
  if (url.includes('feeds/videos.xml')) {
    return url
  }

  // Direct channel ID URL: youtube.com/channel/UC...
  const channelIdMatch = url.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/)
  if (channelIdMatch) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdMatch[1]}`
  }

  // Handle URL: youtube.com/@handle — need to fetch page to get channel ID
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // Cache channel resolution for 24h
    })

    if (!res.ok) return null

    const html = await res.text()

    // Look for channel ID in the page HTML
    const cidMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]+)"/)
      || html.match(/channel_id=(UC[a-zA-Z0-9_-]+)/)
      || html.match(/<meta\s+itemprop="channelId"\s+content="(UC[a-zA-Z0-9_-]+)"/)

    if (cidMatch) {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${cidMatch[1]}`
    }
  } catch {
    // Fall through
  }

  return null
}

function parseYouTubeXml(xml: string, limit: number): YouTubeVideo[] {
  const videos: YouTubeVideo[] = []

  // YouTube Atom feed uses <entry> tags
  const entries = xml.split('<entry>').slice(1)

  for (const entry of entries.slice(0, limit)) {
    const title = extractTag(entry, 'title')
    const videoId = extractTag(entry, 'yt:videoId')
    const pubDate = extractTag(entry, 'published')

    // Description from media:group > media:description
    const mediaGroupMatch = entry.match(
      /<media:group>([\s\S]*?)<\/media:group>/,
    )
    const mediaGroup = mediaGroupMatch?.[1] || ''
    const description = extractTag(mediaGroup, 'media:description')

    // Thumbnail from media:thumbnail
    const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/)
    const thumbnail =
      thumbMatch?.[1] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

    // Link
    const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/)
    const link = linkMatch?.[1] || `https://www.youtube.com/watch?v=${videoId}`

    if (title && videoId) {
      videos.push({
        title,
        videoId,
        link,
        thumbnail,
        pubDate,
        description: description.slice(0, 300),
      })
    }
  }

  return videos
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  return match?.[1]?.trim() || ''
}
