import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site-instellingen',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'general',
      label: 'Algemeen',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          required: true,
          defaultValue: 'My Site',
        },
        {
          name: 'tagline',
          type: 'text',
        },
      ],
    },
    {
      type: 'group',
      name: 'about',
      label: 'Over ons',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Wij zijn Ron en Erik',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschrijving',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Afbeelding',
        },
        {
          name: 'authors',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          label: 'Auteurs',
          admin: {
            description: 'Selecteer de auteurs die in de over-ons sectie worden getoond',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'podcast',
      label: 'Podcast',
      fields: [
        {
          name: 'defaultEpisodeImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Standaard aflevering afbeelding',
          admin: {
            description: 'Wordt gebruikt als een aflevering geen eigen uitgelichte afbeelding heeft',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'externalLinks',
      label: 'Externe links',
      fields: [
        {
          name: 'youtubeChannelUrl',
          type: 'text',
          label: 'YouTube Channel URL',
          admin: {
            description: 'Volledige URL naar je YouTube-kanaal (bijv. https://youtube.com/@jouwkanaal)',
          },
        },
        {
          name: 'podcastFeedUrl',
          type: 'text',
          label: 'Podcast RSS Feed URL',
          admin: {
            description: 'RSS-feed-URL van je podcast',
          },
        },
        {
          name: 'spotifyUrl',
          type: 'text',
          label: 'Spotify URL',
          admin: {
            description: 'Volledige URL naar je Spotify-podcast (bijv. https://open.spotify.com/show/...)',
          },
        },
        {
          name: 'patreonUrl',
          type: 'text',
          label: 'Patreon URL',
          admin: {
            description: 'Volledige URL naar je Patreon-pagina',
          },
        },
        {
          name: 'discordUrl',
          type: 'text',
          label: 'Discord URL',
          admin: {
            description: 'Volledige URL naar je Discord-server',
          },
        },
        {
          name: 'unpauseUrl',
          type: 'text',
          label: 'Unpause URL',
          admin: {
            description: 'Volledige URL naar Unpause',
          },
        },
        {
          name: 'patreonPodcastFeedUrl',
          type: 'text',
          label: 'Patreon Podcast RSS Feed URL',
          access: {
            read: ({ req }) => Boolean(req.user),
          },
          admin: {
            description: 'Aparte RSS-feed-URL voor exclusieve Patreon-afleveringen',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'socials',
      label: 'Sociale media',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          label: 'X / Twitter URL',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram URL',
        },
        {
          name: 'tiktok',
          type: 'text',
          label: 'TikTok URL',
        },
      ],
    },
  ],
}
