import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Gebruiker',
    plural: 'Gebruikers',
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Ondertitel',
      admin: {
        description: 'Bijv. "Co-host" of "Redacteur"',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
      admin: {
        description: 'Korte biografie',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
    },
    {
      type: 'group',
      name: 'socials',
      label: 'Sociale media',
      fields: [
        {
          name: 'bluesky',
          type: 'text',
          label: 'BlueSky URL',
        },
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
      ],
    },
  ],
  timestamps: true,
}
