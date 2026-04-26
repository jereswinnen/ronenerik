import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { anyone } from '../../access/anyone'
import { isAdmin, isAdminFieldAccess } from '../../access/isAdmin'
import { isAdminOrSelfUser } from '../../access/isAdminOrSelf'
import { lockGuestRoleOnCreate } from './hooks/lockGuestRoleOnCreate'
import { verifyEmailHTML, verifyEmailSubject } from './email/verifyEmail'
import {
  forgotPasswordEmailHTML,
  forgotPasswordEmailSubject,
} from './email/forgotPasswordEmail'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Gebruiker',
    plural: 'Gebruikers',
  },
  access: {
    admin: authenticated,
    create: anyone,
    delete: isAdmin,
    read: isAdminOrSelfUser,
    update: isAdminOrSelfUser,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
    hidden: ({ user }) => user?.role === 'guest',
  },
  auth: {
    verify: {
      generateEmailHTML: verifyEmailHTML,
      generateEmailSubject: verifyEmailSubject,
    },
    forgotPassword: {
      generateEmailHTML: forgotPasswordEmailHTML,
      generateEmailSubject: forgotPasswordEmailSubject,
    },
  },
  hooks: {
    beforeValidate: [lockGuestRoleOnCreate],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      required: true,
      defaultValue: 'guest',
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
      required: true,
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
        { name: 'bluesky', type: 'text', label: 'BlueSky URL' },
        { name: 'twitter', type: 'text', label: 'X / Twitter URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
      ],
    },
  ],
  timestamps: true,
}
