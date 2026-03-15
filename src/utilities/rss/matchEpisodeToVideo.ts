import type { PodcastEpisode, YouTubeVideo } from './types'

/**
 * Finds the best matching YouTube video for a podcast episode.
 * Matches based on title word overlap and publish date proximity.
 */
export function matchEpisodeToVideo(
  episode: PodcastEpisode,
  videos: YouTubeVideo[],
): YouTubeVideo | null {
  const episodeWords = normalizeTitle(episode.title)
  const episodeDate = new Date(episode.pubDate).getTime()

  let bestMatch: YouTubeVideo | null = null
  let bestScore = 0

  for (const video of videos) {
    const videoWords = normalizeTitle(video.title)
    const overlap = wordOverlap(episodeWords, videoWords)

    if (overlap <= 0.5) continue

    // Check date proximity: within 3 days
    const videoDate = new Date(video.pubDate).getTime()
    const daysDiff = Math.abs(episodeDate - videoDate) / (1000 * 60 * 60 * 24)

    if (daysDiff > 3) continue

    if (overlap > bestScore) {
      bestScore = overlap
      bestMatch = video
    }
  }

  return bestMatch
}

function normalizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2) // Skip short words like "de", "en", "of"
}

function wordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setB = new Set(b)
  const matches = a.filter((word) => setB.has(word)).length
  return matches / Math.max(a.length, b.length)
}
