import type { GlobalConfig } from 'payload'

export const PatreonPage: GlobalConfig = {
  slug: 'patreon-page',
  label: 'Patreon-pagina',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: 'Hero',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Titel',
          defaultValue: 'Kies voor hoeveel je ons wil steunen',
        },
        {
          name: 'socialProof',
          type: 'text',
          label: 'Sociale bewijslast',
          defaultValue: '100+ luisteraars gingen je voor',
        },
      ],
    },
    {
      name: 'plans',
      type: 'array',
      label: 'Abonnementen',
      maxRows: 3,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Naam',
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          label: 'Prijs',
          required: true,
          admin: {
            description: 'Bijv. "€5"',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschrijving',
          admin: {
            description: 'Optionele tekst boven de features',
          },
        },
        {
          name: 'features',
          type: 'array',
          label: 'Voordelen',
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'ctaText',
          type: 'text',
          label: 'Knoptekst',
          required: true,
        },
        {
          name: 'highlighted',
          type: 'checkbox',
          label: 'Uitgelicht',
          defaultValue: false,
          admin: {
            description: 'Toont het abonnement met accent-kleur',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'formats',
      label: 'Formats',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Titel',
          defaultValue: 'Onze gevierde Patreon formats',
        },
        {
          name: 'items',
          type: 'array',
          label: 'Formats',
          maxRows: 6,
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Titel',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Beschrijving',
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Afbeelding',
        },
      ],
    },
  ],
}
