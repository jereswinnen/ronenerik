# Self-registration & Comments — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public self-registration (email-verified) so visitors automatically become `gast` users, and add a Lexical-based comments collection with one level of threading and a 5-minute author edit window. Articles still require admin approval to publish.

**Architecture:**
- Payload-native everywhere. Open `Users.create` to anyone; Payload handles email verification via `auth.verify`. Resend is the email provider via `@payloadcms/email-resend`.
- New `comments` collection with self-referential `parent` (one level enforced by hook), restricted Lexical content, and a 5-minute author edit window enforced by access control. Hidden from non-admins in the admin panel.
- Frontend: thin auth pages call Payload REST endpoints directly. Comments thread is server-rendered on `/artikels/[slug]`; comment form is a client component.

**Tech Stack:** Next.js 15, React 19, Payload 3.77, `@payloadcms/db-vercel-postgres` (Neon), `@payloadcms/richtext-lexical`, `@payloadcms/email-resend`, Tailwind 4, TypeScript, pnpm.

**Spec:** [`docs/superpowers/specs/2026-04-26-self-registration-and-comments-design.md`](../specs/2026-04-26-self-registration-and-comments-design.md).

**Project conventions:**
- No automated tests in this repo. Verification = `pnpm lint`, type-checked build (`pnpm build`), and manual QA in `pnpm dev`.
- Migrations: schema changes are followed by `pnpm payload migrate:create` to generate a migration file. The `pnpm build` script runs migrations automatically.
- After collection or field changes, run `pnpm generate:types` to refresh `src/payload-types.ts`.
- Dutch labels everywhere user-facing.
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.

**Prerequisite (one-time, manual — confirm with user before Task 1):**
- Resend account exists, sending domain `ronenerik.be` is verified, and `RESEND_API_KEY` is added to `.env.local` (dev) and Vercel project env (prod).
- Confirm exact `defaultFromAddress` (placeholder used in this plan: `noreply@ronenerik.be`).

---

## File structure

**New files:**
- `src/collections/Comments/index.ts` — collection config
- `src/collections/Comments/access/isAuthorWithinEditWindowOrAdmin.ts` — access fn
- `src/collections/Comments/hooks/enforceOneLevel.ts` — beforeValidate
- `src/collections/Comments/hooks/setAuthorAndValidatePost.ts` — beforeChange (create)
- `src/collections/Comments/hooks/setEditedAt.ts` — beforeChange (update)
- `src/collections/Comments/hooks/revalidatePostFromComment.ts` — afterChange/afterDelete
- `src/collections/Users/hooks/lockGuestRoleOnCreate.ts` — beforeChange on Users
- `src/collections/Users/email/verifyEmail.ts` — generateEmailHTML/Subject for verification
- `src/collections/Users/email/forgotPasswordEmail.ts` — generateEmailHTML/Subject for forgot-password
- `src/fields/commentEditor.ts` — restricted Lexical config (Bold/Italic/Link/Paragraph)
- `src/hooks/useUser.ts` — client hook returning `{ user, loading, refresh }`
- `src/components/Comments/CommentThread.tsx` — server component
- `src/components/Comments/CommentItem.tsx` — server component (one comment + replies)
- `src/components/Comments/CommentForm.tsx` — client component (Lexical editor + submit)
- `src/components/Comments/CommentsDisabledNotice.tsx` — small notice when disabled
- `src/components/Account/AuthForm.tsx` — small shared form chrome (label/input/button/error)
- `src/app/(frontend)/account/registreren/page.tsx`
- `src/app/(frontend)/account/inloggen/page.tsx`
- `src/app/(frontend)/account/uitloggen/page.tsx`
- `src/app/(frontend)/account/verifieer/page.tsx`
- `src/app/(frontend)/account/wachtwoord-vergeten/page.tsx`
- `src/app/(frontend)/account/wachtwoord-instellen/page.tsx`

**Modified files:**
- `src/collections/Users/index.ts`
- `src/collections/Posts/index.ts`
- `src/payload.config.ts`
- `src/app/(frontend)/artikels/[slug]/page.tsx`
- `.env.example`
- `package.json` (via `pnpm add`)

**Auto-generated (do not hand-edit):**
- `src/payload-types.ts`
- `src/migrations/<timestamp>_*.{ts,json}` (one per schema change)

---

## Task 1: Install Resend adapter and wire it into Payload

**Files:**
- Modify: `package.json`
- Modify: `src/payload.config.ts`
- Modify: `.env.example`

- [ ] **Step 1.1: Install the Resend adapter**

```bash
pnpm add @payloadcms/email-resend@3.77.0
```

Pin to `3.77.0` to match the other `@payloadcms/*` packages already in `package.json`.

- [ ] **Step 1.2: Add `RESEND_API_KEY` to `.env.example`**

Append to `.env.example` (do not modify other lines):

```
# Resend (transactional email — verification, forgot password)
RESEND_API_KEY=
```

- [ ] **Step 1.3: Configure the email adapter in `payload.config.ts`**

Open `src/payload.config.ts`. Add this import near the other adapter imports at the top (alongside `vercelPostgresAdapter`):

```ts
import { resendAdapter } from '@payloadcms/email-resend'
```

Inside the `buildConfig({ ... })` object, add the `email` key directly after the `db: vercelPostgresAdapter(...)` block:

```ts
  email: resendAdapter({
    defaultFromAddress: 'noreply@ronenerik.be',
    defaultFromName: 'Ron en Erik',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
```

- [ ] **Step 1.4: Verify type-check + build still passes**

Run:

```bash
pnpm generate:types && pnpm lint
```

Expected: both succeed with no errors. (We don't run `pnpm build` yet because no schema changes have happened.)

- [ ] **Step 1.5: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example src/payload.config.ts
git commit -m "feat: add Resend email adapter for transactional email"
```

---

## Task 2: Open Users collection to public registration with verification

**Files:**
- Create: `src/collections/Users/hooks/lockGuestRoleOnCreate.ts`
- Create: `src/collections/Users/email/verifyEmail.ts`
- Create: `src/collections/Users/email/forgotPasswordEmail.ts`
- Modify: `src/collections/Users/index.ts`

- [ ] **Step 2.1: Create the role-lock hook**

Create `src/collections/Users/hooks/lockGuestRoleOnCreate.ts`:

```ts
import type { CollectionBeforeValidateHook } from 'payload'
import type { User } from '@/payload-types'

/**
 * Force any non-admin user creation to land as the guest role. Stops a
 * public POST to /api/users from including `role: 'admin'` in the body.
 *
 * The role *value* is `'guest'` (the user-facing label is "Gast" — Dutch
 * for guest). Several files across the codebase already check
 * `user.role === 'guest'`; do not rename without a data migration.
 */
export const lockGuestRoleOnCreate: CollectionBeforeValidateHook<User> = ({
  data,
  operation,
  req,
}) => {
  if (!data) return data
  if (operation !== 'create') return data
  const requestingUser = req.user as User | null | undefined
  if (requestingUser?.role === 'admin') return data
  data.role = 'guest'
  return data
}
```

- [ ] **Step 2.2: Create the verification email template**

Create `src/collections/Users/email/verifyEmail.ts`:

```ts
import { getServerSideURL } from '@/utilities/getURL'

export const verifyEmailSubject = (): string =>
  'Bevestig je e-mailadres voor Ron en Erik'

export const verifyEmailHTML = ({
  token,
  user,
}: {
  token?: string
  user?: { name?: string | null; email?: string | null }
}): string => {
  const url = `${getServerSideURL()}/account/verifieer?token=${token ?? ''}`
  const naam = user?.name?.trim() || 'daar'
  return `
<!doctype html>
<html lang="nl">
  <body style="font-family: -apple-system, system-ui, sans-serif; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px;">Hoi ${naam},</h1>
    <p>Bedankt om een account te maken op <strong>Ron en Erik</strong>. Klik op de knop hieronder om je e-mailadres te bevestigen:</p>
    <p style="margin: 24px 0;">
      <a href="${url}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Bevestig mijn e-mailadres</a>
    </p>
    <p style="color: #666; font-size: 14px;">Werkt de knop niet? Plak deze link in je browser:<br><a href="${url}">${url}</a></p>
    <p style="color: #666; font-size: 14px;">Heb jij dit niet aangevraagd? Negeer deze e-mail dan gewoon.</p>
  </body>
</html>`
}
```

- [ ] **Step 2.3: Create the forgot-password email template**

Create `src/collections/Users/email/forgotPasswordEmail.ts`:

```ts
import { getServerSideURL } from '@/utilities/getURL'

export const forgotPasswordEmailSubject = (): string =>
  'Wachtwoord opnieuw instellen — Ron en Erik'

export const forgotPasswordEmailHTML = ({
  token,
  user,
}: {
  token?: string
  user?: { name?: string | null; email?: string | null }
}): string => {
  const url = `${getServerSideURL()}/account/wachtwoord-instellen?token=${token ?? ''}`
  const naam = user?.name?.trim() || 'daar'
  return `
<!doctype html>
<html lang="nl">
  <body style="font-family: -apple-system, system-ui, sans-serif; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px;">Hoi ${naam},</h1>
    <p>Je vroeg een nieuw wachtwoord aan voor je <strong>Ron en Erik</strong>-account. Klik op de knop hieronder om er één in te stellen:</p>
    <p style="margin: 24px 0;">
      <a href="${url}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">Stel een nieuw wachtwoord in</a>
    </p>
    <p style="color: #666; font-size: 14px;">Werkt de knop niet? Plak deze link in je browser:<br><a href="${url}">${url}</a></p>
    <p style="color: #666; font-size: 14px;">Heb jij dit niet aangevraagd? Dan kan je deze e-mail negeren.</p>
  </body>
</html>`
}
```

- [ ] **Step 2.4: Update the Users collection config**

Open `src/collections/Users/index.ts`. Replace the entire file with:

```ts
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
```

Key changes vs. the previous file:
- `access.create`: `isAdmin` → `anyone`.
- `auth: true` → object with `verify` + custom `forgotPassword`.
- New `beforeValidate` hook locking role to `'guest'` for non-admin creates.
- `role.defaultValue`: `'admin'` → `'guest'` (so signups land as guests by default — additionally enforced by the hook above).
- `name.required`: `true` (was missing).

> **Important:** the role *value* throughout the codebase is `'guest'` (English) and the user-facing *label* is "Gast" (Dutch). Several files check `user.role === 'guest'` directly (Posts hook, CommunitySection, ContentCard, multiple `admin.hidden` rules). Do not rename the value to `'gast'` — it would require a Postgres enum migration plus updating every consumer.

- [ ] **Step 2.5: Generate types and migration**

Run:

```bash
pnpm generate:types
```

Expected: completes with no errors.

Then create the migration:

```bash
pnpm payload migrate:create users_open_registration
```

Expected: a new file `src/migrations/<timestamp>_users_open_registration.ts` plus its `.json` snapshot. The migration should:
- make `users.name` NOT NULL (or rely on default — Payload generates the right SQL).
- alter the `users.role` column default from `'admin'` to `'guest'`.
- add `_verified` / `_verificationToken` columns on `users` (Payload's verify support).

If the migration tries to do anything destructive (e.g. drop a column), open the generated `.ts` file and review before running it. **Do not run the migration here**; the next `pnpm dev` or `pnpm build` will run it.

- [ ] **Step 2.6: Manually verify in dev**

Run:

```bash
pnpm dev
```

Then in another terminal (or browser):

1. Open `http://localhost:3000/admin` and log in as an existing admin. Confirm Users still loads, the role select still shows `Gast`/`Admin`, and that you can edit yourself.
2. POST a registration via curl:

```bash
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"test+verify@example.com","password":"abcd1234","name":"Test","role":"admin"}'
```

Expected response: `201` with `doc.role === "guest"` (proving the role-lock hook works — the request asked for `admin` and got `guest`) and `doc._verified !== true`.

3. Look at the dev server log. If `RESEND_API_KEY` is set, it should log the email send. If not set, the adapter logs a warning — that's fine for dev.

Stop `pnpm dev` (Ctrl-C) before committing.

- [ ] **Step 2.7: Commit**

```bash
git add src/collections/Users src/payload-types.ts src/migrations
git commit -m "feat(users): open registration with email verification"
```

---

## Task 3: Add `commentsEnabled` to Posts

**Files:**
- Modify: `src/collections/Posts/index.ts`

- [ ] **Step 3.1: Add the field**

Open `src/collections/Posts/index.ts`. Inside the `fields` array, immediately **after** the `categories` field block (around line 161) and **before** the `meta` block, insert:

```ts
    {
      name: 'commentsEnabled',
      type: 'checkbox',
      label: 'Reacties toestaan',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Schakel reacties uit als je geen comments wilt op dit artikel.',
      },
    },
```

- [ ] **Step 3.2: Generate types and migration**

```bash
pnpm generate:types
pnpm payload migrate:create posts_comments_enabled
```

Expected: new migration adds `comments_enabled` boolean column with default `true`.

- [ ] **Step 3.3: Verify dev**

```bash
pnpm dev
```

Open the admin, edit any existing post, confirm a "Reacties toestaan" checkbox appears in the sidebar and is checked by default. Save the post; no errors. Stop dev.

- [ ] **Step 3.4: Commit**

```bash
git add src/collections/Posts/index.ts src/payload-types.ts src/migrations
git commit -m "feat(posts): add commentsEnabled toggle"
```

---

## Task 4: Build the restricted comment Lexical editor config

**Files:**
- Create: `src/fields/commentEditor.ts`

- [ ] **Step 4.1: Create the editor config**

Create `src/fields/commentEditor.ts`:

```ts
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
```

- [ ] **Step 4.2: Type-check**

```bash
pnpm lint
```

Expected: no errors for `src/fields/commentEditor.ts`. (The file isn't imported anywhere yet, but it must compile cleanly.)

- [ ] **Step 4.3: Commit**

```bash
git add src/fields/commentEditor.ts
git commit -m "feat: add restricted Lexical config for comments"
```

---

## Task 5: Comments collection — access control

**Files:**
- Create: `src/collections/Comments/access/isAuthorWithinEditWindowOrAdmin.ts`

- [ ] **Step 5.1: Create the access function**

Create `src/collections/Comments/access/isAuthorWithinEditWindowOrAdmin.ts`:

```ts
import type { Access, AccessArgs, Where } from 'payload'
import type { User } from '@/payload-types'

const EDIT_WINDOW_MS = 5 * 60 * 1000

/**
 * Admins always pass. A logged-in author can update/delete their own comment
 * within EDIT_WINDOW_MS of createdAt. Anyone else: no.
 */
export const isAuthorWithinEditWindowOrAdmin: Access = ({
  req: { user },
}: AccessArgs<User>) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const cutoff = new Date(Date.now() - EDIT_WINDOW_MS).toISOString()
  return {
    and: [
      { author: { equals: user.id } },
      { createdAt: { greater_than: cutoff } },
    ],
  } as Where
}
```

- [ ] **Step 5.2: Commit**

```bash
git add src/collections/Comments/access/isAuthorWithinEditWindowOrAdmin.ts
git commit -m "feat(comments): add author edit-window access control"
```

---

## Task 6: Comments collection — hooks

**Files:**
- Create: `src/collections/Comments/hooks/enforceOneLevel.ts`
- Create: `src/collections/Comments/hooks/setAuthorAndValidatePost.ts`
- Create: `src/collections/Comments/hooks/setEditedAt.ts`
- Create: `src/collections/Comments/hooks/revalidatePostFromComment.ts`

- [ ] **Step 6.1: One-level threading enforcement**

Create `src/collections/Comments/hooks/enforceOneLevel.ts`:

```ts
import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'
import type { Comment } from '@/payload-types'

/**
 * Comments are at most one level deep: a top-level comment may have replies,
 * but those replies cannot themselves be replied to. We enforce this at write
 * time by rejecting any comment whose declared parent already has a parent.
 */
export const enforceOneLevel: CollectionBeforeValidateHook<Comment> = async ({
  data,
  req,
}) => {
  if (!data?.parent) return data
  const parentId =
    typeof data.parent === 'object' ? (data.parent as Comment).id : data.parent
  if (!parentId) return data
  const parent = await req.payload.findByID({
    collection: 'comments',
    id: parentId,
    depth: 0,
  })
  if (parent.parent) {
    throw new ValidationError({
      collection: 'comments',
      errors: [
        {
          path: 'parent',
          message: 'Reacties kunnen maar één niveau diep zijn.',
        },
      ],
    })
  }
  return data
}
```

- [ ] **Step 6.2: Author + commentsEnabled enforcement on create**

Create `src/collections/Comments/hooks/setAuthorAndValidatePost.ts`:

```ts
import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'
import type { Comment, Post, User } from '@/payload-types'

/**
 * On create: force `author` to the requesting user (no spoofing) and reject
 * the create when the target post has comments disabled.
 */
export const setAuthorAndValidatePost: CollectionBeforeChangeHook<Comment> = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data
  const user = req.user as User | null | undefined
  if (!user) {
    throw new APIError('Je moet ingelogd zijn om te reageren.', 401)
  }
  data.author = user.id

  const postId =
    typeof data.post === 'object' ? (data.post as Post).id : data.post
  if (!postId) {
    throw new APIError('Reactie heeft geen artikel.', 400)
  }
  const post = await req.payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 0,
  })
  if (!post.commentsEnabled) {
    throw new APIError('Reacties zijn uitgeschakeld voor dit artikel.', 403)
  }
  return data
}
```

- [ ] **Step 6.3: editedAt on update**

Create `src/collections/Comments/hooks/setEditedAt.ts`:

```ts
import type { CollectionBeforeChangeHook } from 'payload'
import type { Comment } from '@/payload-types'

/**
 * Stamp `editedAt` whenever the body of an existing comment changes. We
 * compare serialized JSON because Lexical content is a nested object.
 */
export const setEditedAt: CollectionBeforeChangeHook<Comment> = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update') return data
  if (!data?.content) return data
  const before = JSON.stringify(originalDoc?.content ?? null)
  const after = JSON.stringify(data.content)
  if (before !== after) {
    data.editedAt = new Date().toISOString()
  }
  return data
}
```

- [ ] **Step 6.4: Revalidate the article page on comment changes**

Create `src/collections/Comments/hooks/revalidatePostFromComment.ts`:

```ts
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { revalidatePath } from 'next/cache'
import type { Comment, Post } from '@/payload-types'

const slugFromPost = async (
  postRef: Comment['post'] | undefined,
  payload: Parameters<CollectionAfterChangeHook<Comment>>[0]['req']['payload'],
): Promise<string | null> => {
  if (!postRef) return null
  // Guard truthiness BEFORE typeof — `typeof null === 'object'` in JS.
  if (postRef && typeof postRef === 'object') {
    return (postRef as Post).slug ?? null
  }
  try {
    const post = await payload.findByID({
      collection: 'posts',
      id: postRef as number | string,
      depth: 0,
    })
    return post.slug ?? null
  } catch {
    return null
  }
}

export const revalidatePostFromCommentChange: CollectionAfterChangeHook<Comment> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  const slug = await slugFromPost(doc.post, payload)
  if (slug) {
    revalidatePath(`/artikels/${slug}`)
  }
  return doc
}

export const revalidatePostFromCommentDelete: CollectionAfterDeleteHook<Comment> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  const slug = await slugFromPost(doc?.post, payload)
  if (slug) {
    revalidatePath(`/artikels/${slug}`)
  }
  return doc
}
```

- [ ] **Step 6.5: Commit**

```bash
git add src/collections/Comments/hooks
git commit -m "feat(comments): add hooks for threading, authoring, edit timestamps, revalidation"
```

---

## Task 7: Comments collection — config + register

**Files:**
- Create: `src/collections/Comments/index.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 7.1: Create the collection config**

Create `src/collections/Comments/index.ts`:

```ts
import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { isAdmin } from '../../access/isAdmin'
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
    admin: isAdmin,
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
```

- [ ] **Step 7.2: Register the collection**

Open `src/payload.config.ts`. Add this import alongside the other collection imports near the top:

```ts
import { Comments } from './collections/Comments'
```

Then update the `collections` array (currently `[Pages, Posts, Media, Categories, PodcastEpisodes, Users]`) to include `Comments`:

```ts
  collections: [Pages, Posts, Media, Categories, PodcastEpisodes, Comments, Users],
```

- [ ] **Step 7.3: Generate types and migration**

```bash
pnpm generate:types
pnpm payload migrate:create comments_collection
```

Expected: a migration that creates the `comments` table with `id`, `post_id`, `author_id`, `parent_id` (self-FK, nullable), `content` (jsonb), `edited_at`, `created_at`, `updated_at`, and indexes on `post_id`, `author_id`, `parent_id`.

- [ ] **Step 7.4: Manual verification in dev**

```bash
pnpm dev
```

1. Open `http://localhost:3000/admin` as admin. The "Reacties" collection should appear in the sidebar.
2. Create a comment manually via the admin: pick a post, an author, type some content, save. Confirm it persists.
3. Try to create a reply to a reply via the admin: edit a top-level comment to be the parent, save a new comment with that parent — fine. Then try to make a third comment whose parent is the reply — saving must fail with the Dutch error message.
4. Log out, log in as a non-admin (or curl `GET /api/users/logout` and re-login as a `gast`). The "Reacties" collection should be **hidden from the sidebar**.

Stop dev.

- [ ] **Step 7.5: Commit**

```bash
git add src/collections/Comments/index.ts src/payload.config.ts src/payload-types.ts src/migrations
git commit -m "feat(comments): add comments collection with one-level threading"
```

---

## Task 8: `useUser` client hook

**Files:**
- Create: `src/hooks/useUser.ts`

- [ ] **Step 8.1: Create the hook**

Create `src/hooks/useUser.ts`:

```ts
'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@/payload-types'

type UseUserResult = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
}

/**
 * Fetches /api/users/me on mount. Use anywhere on the client that needs to
 * know whether the current visitor is signed in. No global cache: each
 * consumer fetches once; cheap and simple.
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = (await res.json()) as { user?: User | null }
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { user, loading, refresh }
}
```

- [ ] **Step 8.2: Commit**

```bash
git add src/hooks/useUser.ts
git commit -m "feat: add useUser client hook"
```

---

## Task 9: Auth UI — shared form chrome

**Files:**
- Create: `src/components/Account/AuthForm.tsx`

- [ ] **Step 9.1: Create the shared form components**

Create `src/components/Account/AuthForm.tsx`:

```tsx
'use client'

import React from 'react'

export function AuthShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="max-w-md mx-auto flex flex-col gap-6 px-4 py-12 md:py-20">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </section>
  )
}

export function AuthField({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
  defaultValue?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="border border-c-foreground/20 rounded px-3 py-2 bg-c-background"
      />
    </label>
  )
}

export function AuthButton({
  children,
  pending,
}: {
  children: React.ReactNode
  pending?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-c-foreground text-c-background rounded px-4 py-2 font-medium disabled:opacity-50"
    >
      {pending ? 'Bezig…' : children}
    </button>
  )
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="text-sm text-red-600">
      {message}
    </p>
  )
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <p role="status" className="text-sm text-green-700">
      {message}
    </p>
  )
}
```

- [ ] **Step 9.2: Commit**

```bash
git add src/components/Account/AuthForm.tsx
git commit -m "feat(account): shared auth form components"
```

---

## Task 10: Auth UI — registration page

**Files:**
- Create: `src/app/(frontend)/account/registreren/page.tsx`

- [ ] **Step 10.1: Create the registration page**

Create `src/app/(frontend)/account/registreren/page.tsx`:

```tsx
'use client'

import React, { useState } from 'react'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
  AuthSuccess,
} from '@/components/Account/AuthForm'

export default function RegistrerenPage() {
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password') ?? '')
    const passwordConfirm = String(form.get('passwordConfirm') ?? '')
    if (password !== passwordConfirm) {
      setError('De wachtwoorden komen niet overeen.')
      setPending(false)
      return
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: String(form.get('email') ?? ''),
          name: String(form.get('name') ?? ''),
          password,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          body.errors?.[0]?.message ??
            'Er ging iets mis bij het aanmaken van je account.',
        )
        return
      }
      setSubmitted(true)
    } finally {
      setPending(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell title="Bevestig je e-mailadres">
        <AuthSuccess message="We hebben je een bevestigingsmail gestuurd. Klik op de link in die mail om je account te activeren." />
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Account aanmaken">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label="Naam" name="name" required autoComplete="name" />
        <AuthField
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <AuthField
          label="Wachtwoord"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <AuthField
          label="Wachtwoord (herhalen)"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
        />
        <AuthError message={error} />
        <AuthButton pending={pending}>Account aanmaken</AuthButton>
        <p className="text-sm text-c-foreground/60">
          Al een account? <a href="/account/inloggen" className="underline">Inloggen</a>
        </p>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 10.2: Commit**

```bash
git add src/app/\(frontend\)/account/registreren/page.tsx
git commit -m "feat(account): registration page"
```

---

## Task 11: Auth UI — login, logout, verify pages

**Files:**
- Create: `src/app/(frontend)/account/inloggen/page.tsx`
- Create: `src/app/(frontend)/account/uitloggen/page.tsx`
- Create: `src/app/(frontend)/account/verifieer/page.tsx`

- [ ] **Step 11.1: Login page**

Create `src/app/(frontend)/account/inloggen/page.tsx`:

```tsx
'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
} from '@/components/Account/AuthForm'

export default function InloggenPage() {
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search.get('redirect') || '/'
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          body.errors?.[0]?.message ??
            'Inloggen mislukt. Controleer je e-mail en wachtwoord.',
        )
        return
      }
      router.push(redirect)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell title="Inloggen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <AuthField
          label="Wachtwoord"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <AuthError message={error} />
        <AuthButton pending={pending}>Inloggen</AuthButton>
        <p className="text-sm text-c-foreground/60">
          Geen account?{' '}
          <a href="/account/registreren" className="underline">
            Maak er één aan
          </a>
          . Wachtwoord vergeten?{' '}
          <a href="/account/wachtwoord-vergeten" className="underline">
            Reset hier
          </a>
          .
        </p>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 11.2: Logout page**

Create `src/app/(frontend)/account/uitloggen/page.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthShell } from '@/components/Account/AuthForm'

export default function UitloggenPage() {
  const router = useRouter()
  useEffect(() => {
    void (async () => {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/')
      router.refresh()
    })()
  }, [router])

  return (
    <AuthShell title="Uitloggen…">
      <p>Een ogenblik geduld.</p>
    </AuthShell>
  )
}
```

- [ ] **Step 11.3: Verify page**

Create `src/app/(frontend)/account/verifieer/page.tsx`:

```tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AuthError,
  AuthShell,
  AuthSuccess,
} from '@/components/Account/AuthForm'

type Status = 'pending' | 'ok' | 'error'

export default function VerifieerPage() {
  const search = useSearchParams()
  const token = search.get('token')
  const [status, setStatus] = useState<Status>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Geen geldige token in de URL.')
      return
    }
    void (async () => {
      const res = await fetch(`/api/users/verify/${encodeURIComponent(token)}`, {
        method: 'POST',
      })
      if (res.ok) {
        setStatus('ok')
      } else {
        const body = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          body.errors?.[0]?.message ??
            'Bevestigen mislukt. De link is mogelijk verlopen.',
        )
        setStatus('error')
      }
    })()
  }, [token])

  return (
    <AuthShell title="E-mail bevestigen">
      {status === 'pending' && <p>Bezig met bevestigen…</p>}
      {status === 'ok' && (
        <AuthSuccess message="Je e-mailadres is bevestigd. Je kan nu inloggen." />
      )}
      {status === 'error' && <AuthError message={error} />}
      {status !== 'pending' && (
        <p className="text-sm">
          <a href="/account/inloggen" className="underline">
            Naar inloggen
          </a>
        </p>
      )}
    </AuthShell>
  )
}
```

- [ ] **Step 11.4: Commit**

```bash
git add src/app/\(frontend\)/account/inloggen src/app/\(frontend\)/account/uitloggen src/app/\(frontend\)/account/verifieer
git commit -m "feat(account): login, logout, verify pages"
```

---

## Task 12: Auth UI — forgot/reset password pages

**Files:**
- Create: `src/app/(frontend)/account/wachtwoord-vergeten/page.tsx`
- Create: `src/app/(frontend)/account/wachtwoord-instellen/page.tsx`

- [ ] **Step 12.1: Forgot password page**

Create `src/app/(frontend)/account/wachtwoord-vergeten/page.tsx`:

```tsx
'use client'

import React, { useState } from 'react'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
  AuthSuccess,
} from '@/components/Account/AuthForm'

export default function WachtwoordVergetenPage() {
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(form.get('email') ?? ''),
        }),
      })
      if (!res.ok) {
        setError('Aanvraag mislukt. Probeer het later opnieuw.')
        return
      }
      setSubmitted(true)
    } finally {
      setPending(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell title="Check je inbox">
        <AuthSuccess message="Als je e-mailadres bekend is, sturen we je een link om je wachtwoord opnieuw in te stellen." />
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Wachtwoord vergeten">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <AuthError message={error} />
        <AuthButton pending={pending}>Stuur reset-link</AuthButton>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 12.2: Reset password page**

Create `src/app/(frontend)/account/wachtwoord-instellen/page.tsx`:

```tsx
'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
} from '@/components/Account/AuthForm'

export default function WachtwoordInstellenPage() {
  const router = useRouter()
  const search = useSearchParams()
  const token = search.get('token') || ''
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password') ?? '')
    const passwordConfirm = String(form.get('passwordConfirm') ?? '')
    if (password !== passwordConfirm) {
      setError('De wachtwoorden komen niet overeen.')
      setPending(false)
      return
    }
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        setError('Reset mislukt. De link is mogelijk verlopen.')
        return
      }
      router.push('/account/inloggen')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell title="Nieuw wachtwoord instellen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Nieuw wachtwoord"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <AuthField
          label="Nieuw wachtwoord (herhalen)"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
        />
        <AuthError message={error} />
        <AuthButton pending={pending}>Wachtwoord instellen</AuthButton>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 12.3: Commit**

```bash
git add src/app/\(frontend\)/account/wachtwoord-vergeten src/app/\(frontend\)/account/wachtwoord-instellen
git commit -m "feat(account): forgot and reset password pages"
```

---

## Task 13: End-to-end auth verification (manual)

- [ ] **Step 13.1: Run dev**

```bash
pnpm dev
```

- [ ] **Step 13.2: Walk the full flow**

In the browser:

1. Go to `/account/registreren`. Submit the form with a real email you can check (or use Resend's test recipient `delivered@resend.dev`).
2. Confirm "Check je inbox" appears.
3. If using a real address: open the email, click the link, land on `/account/verifieer?token=...`, see the success message.
4. Go to `/account/inloggen`, log in. Confirm you land on `/`.
5. Hit `/api/users/me` directly — `user.role` should be `gast`, `user._verified` should be `true`.
6. Go to `/admin`. You should be able to log in (you're an authenticated user), but the Users and Reacties collections should be hidden from the sidebar.
7. Go to `/account/uitloggen`. You should be logged out.
8. Test forgot-password: `/account/wachtwoord-vergeten`, submit, click the email link, set a new password, log in with it.

If anything fails, fix in place and re-run before committing.

- [ ] **Step 13.3: Stop dev** (Ctrl-C). No commit — this task is verification only.

---

## Task 14: Comments thread — server components

**Files:**
- Create: `src/components/Comments/CommentsDisabledNotice.tsx`
- Create: `src/components/Comments/CommentItem.tsx`
- Create: `src/components/Comments/CommentThread.tsx`

- [ ] **Step 14.1: Disabled notice**

Create `src/components/Comments/CommentsDisabledNotice.tsx`:

```tsx
import React from 'react'

export function CommentsDisabledNotice() {
  return (
    <p className="text-sm text-c-foreground/60 italic">
      Reacties zijn uitgeschakeld voor dit artikel.
    </p>
  )
}
```

- [ ] **Step 14.2: Comment item (server component)**

Create `src/components/Comments/CommentItem.tsx`:

```tsx
import React from 'react'
import RichText from '@/components/RichText'
import type { Comment, User } from '@/payload-types'

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('nl-BE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))

type Props = {
  comment: Comment
  replies?: Comment[]
  postId: string | number
  postSlug: string
}

export function CommentItem({ comment, replies = [], postId, postSlug }: Props) {
  const author = typeof comment.author === 'object' ? (comment.author as User) : null
  const name = author?.name || 'Onbekend'
  const editedSuffix = comment.editedAt ? ' (bewerkt)' : ''

  return (
    <li className="flex flex-col gap-2 border-l-2 border-c-foreground/10 pl-4">
      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-c-foreground/50">
          {formatDate(comment.createdAt)}
          {editedSuffix}
        </span>
      </div>
      <div className="prose prose-sm">
        <RichText data={comment.content} enableGutter={false} />
      </div>
      {/* Edit/delete + reply controls live in the client form mounted by CommentThread */}
      <div data-comment-controls={comment.id} />
      {replies.length > 0 && (
        <ul className="flex flex-col gap-4 mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              postSlug={postSlug}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
```

- [ ] **Step 14.3: Comment thread (server component)**

Create `src/components/Comments/CommentThread.tsx`:

```tsx
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Comment } from '@/payload-types'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'

type Props = {
  postId: string | number
  postSlug: string
}

export async function CommentThread({ postId, postSlug }: Props) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'comments',
    where: { post: { equals: postId } },
    sort: 'createdAt',
    depth: 1,
    limit: 200,
    overrideAccess: true,
  })

  const comments = result.docs as Comment[]
  const topLevel = comments.filter((c) => !c.parent)
  const repliesByParent = new Map<string | number, Comment[]>()
  for (const c of comments) {
    if (!c.parent) continue
    const parentId =
      typeof c.parent === 'object' ? (c.parent as Comment).id : c.parent
    const list = repliesByParent.get(parentId) ?? []
    list.push(c)
    repliesByParent.set(parentId, list)
  }

  return (
    <section
      id="reacties"
      className="w-full max-w-2xl mx-auto flex flex-col gap-6 px-4 md:px-0"
    >
      <h3 className="text-xl font-bold">Reacties ({comments.length})</h3>
      {topLevel.length === 0 ? (
        <p className="text-sm text-c-foreground/60">
          Nog geen reacties. Wees de eerste!
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesByParent.get(c.id) ?? []}
              postId={postId}
              postSlug={postSlug}
            />
          ))}
        </ul>
      )}
      <CommentForm postId={postId} />
    </section>
  )
}
```

- [ ] **Step 14.4: Commit (form is referenced but not yet created — next task)**

Don't commit yet. Move on; we'll commit after the form is in place.

---

## Task 15: Comments thread — client form

**Files:**
- Create: `src/components/Comments/CommentForm.tsx`

- [ ] **Step 15.1: Build the form**

Create `src/components/Comments/CommentForm.tsx`. We use a plain `<textarea>` for v1 — the Lexical editor inside the admin is overkill for inline comments and the `richText` field on the server still accepts a Lexical doc that we build from the textarea. To keep the wire format compatible with the `richText` field, we wrap the user's text into a minimal Lexical document on submit:

```tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

type Props = {
  postId: string | number
  parentId?: string | number
  initialText?: string
  commentId?: string | number
  mode?: 'create' | 'edit'
  onDone?: () => void
}

const lexicalFromPlainText = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: text
      .split(/\n{2,}/)
      .filter((p) => p.trim().length > 0)
      .map((para) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: para.split('\n').flatMap((line, idx, arr) => {
          const node = {
            type: 'text',
            text: line,
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
            version: 1,
          }
          return idx < arr.length - 1
            ? [node, { type: 'linebreak', version: 1 }]
            : [node]
        }),
      })),
  },
})

export function CommentForm({
  postId,
  parentId,
  initialText = '',
  commentId,
  mode = 'create',
  onDone,
}: Props) {
  const router = useRouter()
  const { user, loading } = useUser()
  const [text, setText] = useState(initialText)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (loading) {
    return <p className="text-sm text-c-foreground/50">Laden…</p>
  }

  if (!user) {
    return (
      <p className="text-sm">
        <a href="/account/inloggen" className="underline">
          Log in
        </a>{' '}
        of{' '}
        <a href="/account/registreren" className="underline">
          maak een account aan
        </a>{' '}
        om te reageren.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (text.trim().length === 0) {
      setError('Reactie kan niet leeg zijn.')
      return
    }
    setPending(true)
    try {
      const body = {
        post: postId,
        parent: parentId ?? undefined,
        content: lexicalFromPlainText(text),
      }
      const url =
        mode === 'edit' && commentId
          ? `/api/comments/${commentId}`
          : '/api/comments'
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
        }
        setError(
          json.errors?.[0]?.message ??
            'Reactie kon niet opgeslagen worden.',
        )
        return
      }
      setText('')
      onDone?.()
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="sr-only">
          {mode === 'edit' ? 'Reactie bewerken' : 'Schrijf een reactie'}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="border border-c-foreground/20 rounded p-3 bg-c-background"
          placeholder={
            parentId
              ? 'Antwoord hierop…'
              : 'Schrijf hier je reactie. Lege regels maken een nieuwe alinea.'
          }
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-c-foreground text-c-background rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? 'Versturen…' : mode === 'edit' ? 'Opslaan' : 'Plaats reactie'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded px-4 py-2 text-sm border border-c-foreground/20"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  )
}
```

> **Note on scope:** Spec called for light formatting (bold/italic/links). For v1 we ship a plain textarea with paragraph support so users can post immediately. Bold/italic/link is enabled in the underlying `richText` field, so we can upgrade the input to a real Lexical editor in a follow-up plan without touching the database. This keeps Task 15 a single-component task.

- [ ] **Step 15.2: Commit Tasks 14 + 15 together**

```bash
git add src/components/Comments
git commit -m "feat(comments): server-rendered thread + client form"
```

---

## Task 16: Reply / edit / delete controls

**Files:**
- Create: `src/components/Comments/CommentControls.tsx`
- Modify: `src/components/Comments/CommentItem.tsx`

- [ ] **Step 16.1: Build the controls component**

Create `src/components/Comments/CommentControls.tsx`:

```tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { CommentForm } from './CommentForm'
import type { Comment } from '@/payload-types'

const EDIT_WINDOW_MS = 5 * 60 * 1000

type Mode = 'idle' | 'replying' | 'editing'

const richTextToPlain = (data: Comment['content']): string => {
  const root = (data as { root?: { children?: unknown[] } } | null)?.root
  if (!root?.children) return ''
  const lines: string[] = []
  for (const node of root.children as Array<{
    type?: string
    children?: Array<{ type?: string; text?: string }>
  }>) {
    if (node.type !== 'paragraph') continue
    const para = (node.children ?? [])
      .map((c) => {
        if (c.type === 'linebreak') return '\n'
        return c.text ?? ''
      })
      .join('')
    lines.push(para)
  }
  return lines.join('\n\n')
}

type Props = {
  comment: Comment
  postId: string | number
  isReply: boolean
}

export function CommentControls({ comment, postId, isReply }: Props) {
  const router = useRouter()
  const { user } = useUser()
  const [mode, setMode] = useState<Mode>('idle')
  const [pendingDelete, setPendingDelete] = useState(false)

  const authorId =
    typeof comment.author === 'object' ? comment.author?.id : comment.author
  const isOwner = user && authorId && user.id === authorId
  const isAdmin = user?.role === 'admin'
  const withinWindow =
    Date.now() - new Date(comment.createdAt).getTime() < EDIT_WINDOW_MS
  const canEdit = (isOwner && withinWindow) || isAdmin
  const canReply = !!user && !isReply

  const handleDelete = async () => {
    if (!confirm('Reactie verwijderen?')) return
    setPendingDelete(true)
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        alert('Verwijderen mislukt.')
        return
      }
      router.refresh()
    } finally {
      setPendingDelete(false)
    }
  }

  if (mode === 'editing') {
    return (
      <CommentForm
        postId={postId}
        commentId={comment.id}
        mode="edit"
        initialText={richTextToPlain(comment.content)}
        onDone={() => setMode('idle')}
      />
    )
  }

  if (mode === 'replying') {
    return (
      <CommentForm
        postId={postId}
        parentId={comment.id}
        onDone={() => setMode('idle')}
      />
    )
  }

  return (
    <div className="flex gap-3 text-xs text-c-foreground/60">
      {canReply && (
        <button onClick={() => setMode('replying')} className="underline">
          Antwoord
        </button>
      )}
      {canEdit && (
        <button onClick={() => setMode('editing')} className="underline">
          Bewerk
        </button>
      )}
      {canEdit && (
        <button
          onClick={handleDelete}
          disabled={pendingDelete}
          className="underline text-red-600"
        >
          Verwijder
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 16.2: Mount controls inside `CommentItem`**

Open `src/components/Comments/CommentItem.tsx`. Replace the placeholder `<div data-comment-controls={comment.id} />` line with:

```tsx
      <CommentControls
        comment={comment}
        postId={postId}
        isReply={Boolean(comment.parent)}
      />
```

And add the import at the top:

```tsx
import { CommentControls } from './CommentControls'
```

- [ ] **Step 16.3: Commit**

```bash
git add src/components/Comments/CommentControls.tsx src/components/Comments/CommentItem.tsx
git commit -m "feat(comments): reply, edit, delete controls"
```

---

## Task 17: Wire the thread into the article page

**Files:**
- Modify: `src/app/(frontend)/artikels/[slug]/page.tsx`

- [ ] **Step 17.1: Render `<CommentThread />` (or the disabled notice)**

Open `src/app/(frontend)/artikels/[slug]/page.tsx`.

Add these imports near the existing component imports:

```ts
import { CommentThread } from '@/components/Comments/CommentThread'
import { CommentsDisabledNotice } from '@/components/Comments/CommentsDisabledNotice'
```

Inside the `<section>` returned by `ArticlePage`, **after** the closing `</div>` that wraps the rating + authors block (currently the `<div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-12">…</div>` near line 80–104) and **before** `<PatreonSection />`, insert:

```tsx
      {post.commentsEnabled === false ? (
        <div className="w-full max-w-2xl mx-auto px-4 md:px-0">
          <CommentsDisabledNotice />
        </div>
      ) : (
        <CommentThread postId={post.id} postSlug={post.slug ?? decodedSlug} />
      )}
```

- [ ] **Step 17.2: Type-check**

```bash
pnpm generate:types && pnpm lint
```

Expected: no errors.

- [ ] **Step 17.3: Commit**

```bash
git add src/app/\(frontend\)/artikels/\[slug\]/page.tsx
git commit -m "feat(artikels): render comment thread under each article"
```

---

## Task 18: End-to-end comment verification (manual)

- [ ] **Step 18.1: Run dev**

```bash
pnpm dev
```

- [ ] **Step 18.2: Walk the comment flow**

1. Open any published article at `/artikels/<slug>` while **logged out**. The "Reacties" section should show "Log in of maak een account aan om te reageren." Existing comments (none yet) should not show a form.
2. Log in as your verified `gast` test user.
3. Reload the article. Type a comment, hit "Plaats reactie". The comment should appear immediately after `router.refresh()`.
4. Click "Antwoord" on your comment, post a reply. The reply renders nested under the parent.
5. Try to click "Antwoord" on the reply — the button should not appear (one-level rule).
6. Within 5 minutes: click "Bewerk", change the text, save. The comment shows "(bewerkt)".
7. Click "Verwijder" on a comment, confirm — comment disappears.
8. Open another browser as **admin**. Visit the same article. You should see Edit/Delete on every comment regardless of age.
9. In the admin, edit the article and uncheck "Reacties toestaan". Save. Reload the public page — you should see "Reacties zijn uitgeschakeld voor dit artikel." instead of the thread.
10. Re-enable comments.
11. Try to POST a comment to a comments-disabled post via curl — expect 403 with the Dutch error.

```bash
# Replace cookies + IDs with real values from your dev session
curl -X POST http://localhost:3000/api/comments \
  -H 'Content-Type: application/json' \
  -b 'payload-token=...' \
  -d '{"post":"<post-id>","content":{"root":{"type":"root","children":[]}}}'
```

If anything breaks, fix and re-verify before continuing.

- [ ] **Step 18.3: Stop dev** (Ctrl-C). No commit — verification only.

---

## Task 19: Final build + lint sweep

- [ ] **Step 19.1: Lint**

```bash
pnpm lint
```

Expected: passes.

- [ ] **Step 19.2: Full production build (runs migrations)**

```bash
pnpm build
```

Expected: migrations run cleanly, Next build succeeds with no type errors. If a migration fails, **do not edit the failing migration in place** — investigate the schema delta, fix the collection config, regenerate the migration.

- [ ] **Step 19.3: Final commit (only if anything was tweaked during the build)**

If lint/build forced you to edit code:

```bash
git add -A
git commit -m "chore: lint and build fixes"
```

If nothing changed, skip. Plan complete.
