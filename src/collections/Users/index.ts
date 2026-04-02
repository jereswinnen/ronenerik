import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminFieldAccess } from '../../access/isAdmin'
import { isAdminOrSelfUser } from '../../access/isAdminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Gebruiker',
    plural: 'Gebruikers',
  },
  access: {
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelfUser,
    update: isAdminOrSelfUser,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
    hidden: ({ user }) => user?.role === 'guest',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Gast', value: 'guest' },
      ],
      access: {
        update: isAdminFieldAccess,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Naam',
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
