import type { CollectionAfterReadHook } from 'payload'
import type { User } from 'src/payload-types'

// The `user` collection has access control locked so that users are not publicly accessible.
// We populate author data manually here to protect user privacy while exposing what's needed.
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req: { payload } }) => {
  if (!doc?.authors?.length) return doc

  const authorDocs: User[] = []

  for (const author of doc.authors) {
    try {
      const authorDoc = await payload.findByID({
        id: typeof author === 'object' ? author?.id : author,
        collection: 'users',
        depth: 1,
      })
      if (authorDoc) authorDocs.push(authorDoc)
    } catch {
      // User may have been deleted
    }
  }

  if (authorDocs.length > 0) {
    doc.populatedAuthors = authorDocs.map((author) => ({
      id: author.id,
      name: author.name,
      subtitle: author.subtitle || null,
      avatarUrl:
        typeof author.avatar === 'object' && author.avatar?.url
          ? author.avatar.url
          : null,
      bluesky: author.socials?.bluesky || null,
      twitter: author.socials?.twitter || null,
    }))
  }

  return doc
}
