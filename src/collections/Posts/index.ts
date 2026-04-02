import type { CollectionConfig } from 'payload'

import {
  BlockquoteFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import type { Where } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminFieldAccess } from '../../access/isAdmin'
import { isAdminOrOwner } from '../../access/isAdminOrSelf'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: {
    singular: 'Artikel',
    plural: 'Artikels',
  },
  access: {
    create: authenticated,
    delete: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return { _status: { equals: 'published' } } as Where
      if (user.role === 'admin') return true
      return {
        or: [
          { authors: { contains: user.id } },
          { _status: { equals: 'published' } },
        ],
      } as Where
    },
    update: isAdminOrOwner('authors'),
  },
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Ondertitel',
      admin: {
        description: 'Optionele ondertitel die onder de titel wordt getoond',
      },
    },
    {
      name: 'rating',
      type: 'select',
      label: 'Ron en Erik schaal',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
        { label: '7', value: '7' },
        { label: '7.5', value: '7.5' },
        { label: '8', value: '8' },
        { label: '9', value: '9' },
        { label: '10', value: '10' },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      label: 'Hoofdafbeelding',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhoud',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            BlockquoteFeature(),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
            UploadFeature({
              collections: {
                media: {
                  fields: [
                    {
                      name: 'caption',
                      type: 'text',
                      label: 'Bijschrift',
                    },
                  ],
                },
              },
            }),
          ]
        },
      }),
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      label: 'Categorieën',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        OverviewField({
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
          imagePath: 'meta.image',
        }),
        MetaTitleField({
          hasGenerateFn: true,
        }),
        MetaImageField({
          relationTo: 'media',
        }),
        MetaDescriptionField({}),
        PreviewField({
          hasGenerateFn: true,
          titlePath: 'meta.title',
          descriptionPath: 'meta.description',
        }),
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publicatiedatum',
      access: {
        update: isAdminFieldAccess,
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      label: 'Auteurs',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        { name: 'id', type: 'text' },
        { name: 'name', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'bio', type: 'textarea' },
        { name: 'avatarUrl', type: 'text' },
        { name: 'bluesky', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'instagram', type: 'text' },
      ],
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [
      ({ req, data, originalDoc }) => {
        if (!req.user || !data) return data
        if (req.user.role === 'guest') {
          // Prevent guests from publishing or scheduling
          if (data._status === 'published') {
            data._status = originalDoc?._status || 'draft'
          }
          if (data.publishedAt !== undefined && data.publishedAt !== originalDoc?.publishedAt) {
            data.publishedAt = originalDoc?.publishedAt
          }
          // Prevent self-lockout from authors array
          const authors = Array.isArray(data.authors) ? data.authors : []
          if (!authors.includes(req.user.id)) {
            data.authors = [...authors, req.user.id]
          }
        }
        return data
      },
    ],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
