import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  labels: {
    singular: 'Podcast Aflevering',
    plural: 'Podcast Afleveringen',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultSort: '-publishedAt',
  admin: {
    defaultColumns: ['title', 'publishedAt', 'featuredImage'],
    useAsTitle: 'title',
    description: 'Automatisch aangemaakt vanuit de podcast RSS-feed. Upload een uitgelichte afbeelding per aflevering.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'Titel uit de RSS-feed (automatisch ingevuld)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Slug uit de RSS-feed (automatisch ingevuld)',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publicatiedatum',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Datum uit de RSS-feed (automatisch ingevuld)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Uitgelichte afbeelding',
      admin: {
        description: 'Optioneel — overschrijft de standaard podcast afbeelding',
      },
    },
  ],
}
