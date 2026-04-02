import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { isAdminOrCreator } from '../access/isAdminOrSelf'
import { revalidateMedia } from './Media/hooks/revalidateMedia'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  folders: true,
  hooks: {
    afterChange: [revalidateMedia],
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user && data) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
  },
  access: {
    create: authenticated,
    delete: isAdminOrCreator('createdBy'),
    read: anyone,
    update: isAdminOrCreator('createdBy'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt-tekst',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Bijschrift',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        hidden: true,
      },
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
