export interface PodcastEpisode {
  title: string
  slug: string
  description: string
  audioUrl: string
  link: string
  pubDate: string
  duration?: string
  image?: string
}

export interface YouTubeVideo {
  title: string
  videoId: string
  link: string
  thumbnail: string
  pubDate: string
  description: string
}
