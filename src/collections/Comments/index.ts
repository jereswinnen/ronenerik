import type { CollectionConfig } from 'payload'

import type { User } from '@/payload-types'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { commentEditor } from '../../fields/commentEditor'
import { isAuthorWithinEditWindowOrAdmin } from './access/isAuthorWithinEditWindowOrAdmin'
import { enforceOneLevel } from './hooks/enforceOneLevel'
import { setAuthorAndValidatePost } from './hooks/setAuthorAndValidatePost'
import { setEditedAt } from './hooks/setEditedAt'
import {
  revalidatePostFromCommentChange,
  revalidatePostFromCommentDelete,
} from './hooks/revalidatePostFromComment'

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    singular: 'Reactie',
    plural: 'Reacties',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: isAuthorWithinEditWindowOrAdmin,
    delete: isAuthorWithinEditWindowOrAdmin,
    admin: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },
  admin: {
    defaultColumns: ['author', 'post', 'createdAt'],
    useAsTitle: 'id',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      label: 'Artikel',
      relationTo: 'posts',
      required: true,
      index: true,
    },
    {
      name: 'author',
      type: 'relationship',
      label: 'Auteur',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        update: () => false,
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      label: 'Antwoord op',
      relationTo: 'comments',
      index: true,
      admin: {
        description: 'Optioneel — alleen voor antwoorden (max. 1 niveau diep).',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhoud',
      required: true,
      editor: commentEditor,
    },
    {
      name: 'editedAt',
      type: 'date',
      label: 'Laatst bewerkt',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      access: {
        update: () => false,
      },
    },
  ],
  hooks: {
    beforeValidate: [enforceOneLevel],
    beforeChange: [setAuthorAndValidatePost, setEditedAt],
    afterChange: [revalidatePostFromCommentChange],
    afterDelete: [revalidatePostFromCommentDelete],
  },
  timestamps: true,
}
