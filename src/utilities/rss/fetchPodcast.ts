import type { PodcastEpisode } from './types'
import { slugify } from '@/utilities/slugify'

/**
 * Fetches and parses a podcast RSS feed.
 * Uses Next.js fetch with revalidation for caching.
 */
export async function fetchPodcastEpisodes(
  feedUrl: string,
  limit = 20,
): Promise<PodcastEpisode[]> {
  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!res.ok) {
      console.error(`Failed to fetch podcast feed: ${res.status}`)
      return []
    }

    const xml = await res.text()
    return parsePodcastXml(xml, limit)
  } catch (error) {
    console.error('Error fetching podcast feed:', error)
    return []
  }
}

function parsePodcastXml(xml: string, limit: number): PodcastEpisode[] {
  const episodes: PodcastEpisode[] = []

  // Extract channel-level image as fallback
  const channelImageMatch = xml.match(
    /<itunes:image\s+href="([^"]+)"\s*\/?>/,
  )
  const channelImage = channelImageMatch?.[1] || ''

  // Split by <item> tags
  const items = xml.split('<item>').slice(1)

  for (const item of items.slice(0, limit)) {
    const title = extractTag(item, 'title')
    const description =
      extractTag(item, 'itunes:summary') ||
      extractTag(item, 'description')
    const link = extractTag(item, 'link')
    const pubDate = extractTag(item, 'pubDate')
    const duration = extractTag(item, 'itunes:duration')

    // Get audio URL from enclosure
    const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"/)
    const audioUrl = enclosureMatch?.[1] || ''

    // Episode image or fallback to channel image
    const episodeImageMatch = item.match(
      /<itunes:image\s+href="([^"]+)"\s*\/?>/,
    )
    const image = episodeImageMatch?.[1] || channelImage

    if (title) {
      const cleanTitle = cleanHtml(title)
      episodes.push({
        title: cleanTitle,
        slug: slugify(cleanTitle),
        description: cleanHtml(description).slice(0, 300),
        audioUrl,
        link: link || audioUrl,
        pubDate,
        duration,
        image,
      })
    }
  }

  return episodes
}

function extractTag(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataRegex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
  )
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  // Handle regular tags
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  return match?.[1]?.trim() || ''
}

function cleanHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}
