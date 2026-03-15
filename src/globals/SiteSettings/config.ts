import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'general',
      label: 'General',
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
      name: 'externalLinks',
      label: 'External Links',
      fields: [
        {
          name: 'youtubeChannelUrl',
          type: 'text',
          label: 'YouTube Channel URL',
          admin: {
            description: 'Full URL to your YouTube channel (e.g. https://youtube.com/@yourchannel)',
          },
        },
        {
          name: 'podcastFeedUrl',
          type: 'text',
          label: 'Podcast RSS Feed URL',
          admin: {
            description: 'RSS feed URL for your podcast',
          },
        },
        {
          name: 'patreonUrl',
          type: 'text',
          label: 'Patreon URL',
          admin: {
            description: 'Full URL to your Patreon page',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'patreon',
      label: 'Patreon Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'De extra podcast van deze week',
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Optional subtitle or description for the Patreon section',
          },
        },
        {
          name: 'ctaText',
          type: 'text',
          defaultValue: 'Steun de show',
        },
        {
          name: 'patreonPodcastFeedUrl',
          type: 'text',
          label: 'Patreon Podcast RSS Feed URL',
          access: {
            read: ({ req }) => Boolean(req.user),
          },
          admin: {
            description: 'Separate RSS feed URL for Patreon-exclusive episodes',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'socials',
      label: 'Social Media',
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
          name: 'discord',
          type: 'text',
          label: 'Discord URL',
        },
      ],
    },
  ],
}
