import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * Lexical config for user-submitted comments. Deliberately minimal:
 * paragraphs + bold + italic + plain URL links. No headings, lists,
 * uploads, blockquotes, or anything that could be abused.
 */
export const commentEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      enabledCollections: [],
      fields: ({ defaultFields }) =>
        defaultFields.filter((f) => 'name' in f && f.name === 'url'),
    }),
  ],
})
