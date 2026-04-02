# Guest Writers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `guest` role to the Payload CMS Users collection so guest writers can create/edit their own articles and media without being able to publish, delete, or access admin-only areas.

**Architecture:** Add a `role` select field to Users (`admin` | `guest`, defaulting to `admin`). Create role-aware access control helpers that return Payload `where` queries to scope guests to their own documents. Add a `createdBy` field to Media for ownership tracking. Use `admin.hidden` to restrict sidebar visibility for guests.

**Tech Stack:** Payload CMS 3.77, TypeScript, Next.js 15

---

### Task 1: Create access control helpers

**Files:**
- Create: `src/access/isAdmin.ts`
- Create: `src/access/isAdminOrSelf.ts`

These are pure functions with no external dependencies — they can be written before the `role` field exists.

- [ ] **Step 1: Create `isAdmin` and `isAdminFieldAccess` helpers**

Create `src/access/isAdmin.ts`:

```ts
import type { Access, AccessArgs, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export const isAdmin: Access = ({ req: { user } }: AccessArgs<User>) => {
  if (user && user.role === 'admin') return true
  return false
}

export const isAdminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user && (user as User).role === 'admin') return true
  return false
}
```

- [ ] **Step 2: Create `isAdminOrSelf` helpers**

Create `src/access/isAdminOrSelf.ts` with factory functions for different ownership patterns:

```ts
import type { Access, AccessArgs } from 'payload'
import type { User } from '@/payload-types'

/**
 * Admin: full access. Guest: only documents where the given field contains their user ID.
 * Use for Posts (authors field) and Media (createdBy field).
 */
export const isAdminOrOwner = (ownerField: string): Access => {
  return ({ req: { user } }: AccessArgs<User>) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return { [ownerField]: { contains: user.id } }
  }
}

/**
 * Admin: full access. Guest: only their own user document.
 * Use for the Users collection.
 */
export const isAdminOrSelfUser: Access = ({ req: { user } }: AccessArgs<User>) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

/**
 * Admin: full access. Guest: only documents where createdBy equals their user ID.
 * Use for Media (exact match, not array contains).
 */
export const isAdminOrCreator = (ownerField: string): Access => {
  return ({ req: { user } }: AccessArgs<User>) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return { [ownerField]: { equals: user.id } }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/access/isAdmin.ts src/access/isAdminOrSelf.ts
git commit -m "feat: add role-based access control helpers"
```

---

### Task 2: Add `role` field to Users collection

**Files:**
- Modify: `src/collections/Users/index.ts`

- [ ] **Step 1: Add the `role` field and update access control**

In `src/collections/Users/index.ts`, replace the entire file with:

```ts
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
```

Key changes:
- `create` and `delete`: `isAdmin` (only admins can create/delete users)
- `read` and `update`: `isAdminOrSelfUser` (admins see all, guests see only themselves)
- `admin.hidden`: hides Users from sidebar for guests
- New `role` field with `access.update: isAdminFieldAccess` so guests can't change their role

Note on `read` access: the public read (`() => true`) is replaced by `isAdminOrSelfUser`. However, the `populateAuthors` hook in Posts reads users server-side with `depth: 0` using the internal API which bypasses collection access control. The frontend displays author info via the `populatedAuthors` array field, not direct user queries. If any frontend component relies on the Payload REST/GraphQL API to fetch user profiles publicly, we'd need to add a public read fallback — but checking the current codebase, user data is only served through `populatedAuthors`, so `isAdminOrSelfUser` is safe.

- [ ] **Step 2: Commit**

```bash
git add src/collections/Users/index.ts
git commit -m "feat: add role field to Users with guest access restrictions"
```

---

### Task 3: Update Posts collection access control

**Files:**
- Modify: `src/collections/Posts/index.ts`

- [ ] **Step 1: Update imports and access control**

In `src/collections/Posts/index.ts`, replace the imports and access block.

Replace:
```ts
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
```

With:
```ts
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isAdmin, isAdminFieldAccess } from '../../access/isAdmin'
import { isAdminOrOwner } from '../../access/isAdminOrSelf'
```

Replace the access block:
```ts
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
```

With:
```ts
  access: {
    create: authenticated,
    delete: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return { _status: { equals: 'published' } }
      if (user.role === 'admin') return true
      return {
        or: [
          { authors: { contains: user.id } },
          { _status: { equals: 'published' } },
        ],
      }
    },
    update: isAdminOrOwner('authors'),
  },
```

The `read` access needs custom logic because guests should see their own posts (including drafts) AND published posts (so they can browse), while public users only see published. This is more nuanced than a simple helper.

- [ ] **Step 2: Add field-level access on `_status` and `publishedAt`**

The `_status` field is auto-added by Payload's versioning system. We override it at the collection config level using the `fields` array. Add this to the end of the `fields` array in Posts, just before `slugField()`:

Replace:
```ts
    slugField(),
  ],
```

With:
```ts
    {
      name: '_status',
      type: 'select',
      access: {
        update: isAdminFieldAccess,
      },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    slugField(),
  ],
```

For `publishedAt`, find the existing field definition and add `access.update`:

Replace:
```ts
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publicatiedatum',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
```

With:
```ts
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
```

- [ ] **Step 3: Add `beforeChange` hook to prevent guest author self-lockout**

Add to the hooks section. Replace:

```ts
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
```

With:

```ts
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (!req.user || !data) return data
        if (req.user.role === 'guest') {
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
```

- [ ] **Step 4: Commit**

```bash
git add src/collections/Posts/index.ts
git commit -m "feat: restrict Posts access for guest writers"
```

---

### Task 4: Update Media collection with `createdBy` field and access control

**Files:**
- Modify: `src/collections/Media.ts`

- [ ] **Step 1: Update Media collection**

Replace the entire `src/collections/Media.ts` with:

```ts
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
```

Key changes:
- Import `isAdminOrCreator` for update/delete access
- `beforeChange` hook sets `createdBy` to `req.user.id` on create
- `createdBy` relationship field, hidden from admin UI
- `update` and `delete` use `isAdminOrCreator('createdBy')` — admins can edit all, guests only their own

- [ ] **Step 2: Commit**

```bash
git add src/collections/Media.ts
git commit -m "feat: add createdBy tracking and guest access to Media"
```

---

### Task 5: Update Categories collection access control

**Files:**
- Modify: `src/collections/Categories.ts`

- [ ] **Step 1: Update Categories access**

In `src/collections/Categories.ts`, add the import and update access:

Replace:
```ts
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
```

With:
```ts
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'
import { slugField } from 'payload'
```

Replace the access block:
```ts
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
```

With:
```ts
  access: {
    create: authenticated,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
```

Also add `admin.hidden` for guests:

Replace:
```ts
  admin: {
    useAsTitle: 'title',
  },
```

With:
```ts
  admin: {
    useAsTitle: 'title',
    hidden: ({ user }) => user?.role === 'guest',
  },
```

- [ ] **Step 2: Commit**

```bash
git add src/collections/Categories.ts
git commit -m "feat: restrict Categories edit/delete to admins, hide from guests"
```

---

### Task 6: Hide remaining collections and globals from guests

**Files:**
- Modify: `src/collections/PodcastEpisodes.ts`
- Modify: `src/globals/SiteSettings/config.ts`
- Modify: `src/globals/PatreonPage/config.ts`

Note: Pages already has `admin: { hidden: true }` — it's hidden from everyone, so no change needed.

- [ ] **Step 1: Hide PodcastEpisodes from guests**

In `src/collections/PodcastEpisodes.ts`, replace:

```ts
  admin: {
    defaultColumns: ['title', 'publishedAt', 'featuredImage'],
    useAsTitle: 'title',
    description: 'Automatisch aangemaakt vanuit de podcast RSS-feed. Upload een uitgelichte afbeelding per aflevering.',
  },
```

With:

```ts
  admin: {
    defaultColumns: ['title', 'publishedAt', 'featuredImage'],
    useAsTitle: 'title',
    description: 'Automatisch aangemaakt vanuit de podcast RSS-feed. Upload een uitgelichte afbeelding per aflevering.',
    hidden: ({ user }) => user?.role === 'guest',
  },
```

- [ ] **Step 2: Hide SiteSettings from guests**

In `src/globals/SiteSettings/config.ts`, replace:

```ts
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site-instellingen',
  access: {
    read: () => true,
  },
```

With:

```ts
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site-instellingen',
  access: {
    read: () => true,
  },
  admin: {
    hidden: ({ user }) => user?.role === 'guest',
  },
```

- [ ] **Step 3: Hide PatreonPage from guests**

In `src/globals/PatreonPage/config.ts`, replace:

```ts
export const PatreonPage: GlobalConfig = {
  slug: 'patreon-page',
  label: 'Patreon-pagina',
  access: {
    read: () => true,
  },
```

With:

```ts
export const PatreonPage: GlobalConfig = {
  slug: 'patreon-page',
  label: 'Patreon-pagina',
  access: {
    read: () => true,
  },
  admin: {
    hidden: ({ user }) => user?.role === 'guest',
  },
```

- [ ] **Step 4: Commit**

```bash
git add src/collections/PodcastEpisodes.ts src/globals/SiteSettings/config.ts src/globals/PatreonPage/config.ts
git commit -m "feat: hide PodcastEpisodes, SiteSettings, PatreonPage from guests"
```

---

### Task 7: Regenerate types and create migration

**Files:**
- Modify: `src/payload-types.ts` (auto-generated)
- Create: `src/migrations/` (auto-generated migration file)

- [ ] **Step 1: Regenerate TypeScript types**

```bash
pnpm generate:types
```

This updates `src/payload-types.ts` to include the new `role` field on `User` and `createdBy` field on `Media`.

- [ ] **Step 2: Regenerate import map**

```bash
pnpm generate:importmap
```

- [ ] **Step 3: Create database migration**

```bash
pnpm payload migrate:create
```

When prompted for a name, use `add-user-role-and-media-created-by`. This generates a migration that:
- Adds the `role` column to the `users` table with default `'admin'`
- Adds the `created_by_id` column to the `media` table as a nullable foreign key

- [ ] **Step 4: Verify the generated migration**

Read the generated migration file and confirm:
- It adds a `role` column (or `_users_role` enum) to the users table
- It adds a `created_by_id` column to the media table
- There are NO destructive operations (no DROP, no ALTER column type changes)
- Existing rows are unaffected

- [ ] **Step 5: Commit**

```bash
git add src/payload-types.ts src/migrations/ src/app/\(payload\)/admin/importMap.js
git commit -m "chore: regenerate types and create migration for guest writers"
```

---

### Task 8: Build verification

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

This runs `payload migrate` (applying the new migration) then builds Next.js. Verify:
- Migration applies without errors
- Build completes successfully
- No TypeScript errors

- [ ] **Step 2: Commit any build artifacts if needed**

If the build produces updated files (e.g., import map changes), commit them:

```bash
git add -A && git status
```

Only commit if there are meaningful changes. Do not commit `.next/` or other build output directories.
