# Self-registration & Comments

**Date:** 2026-04-26
**Status:** Design — pending implementation plan

## Goal

Let visitors register for their own account on the site, comment on posts, and (optionally) write articles. Reduce admin toil by removing the manual account-creation step while keeping articles gated behind admin approval.

## Non-goals

- A separate "commenter" role. Everyone non-admin is a `gast`.
- Pre-moderation of individual comments (verification handles spam).
- Email notifications to admins (admin panel is sufficient).
- Threaded discussions deeper than one level.
- Backfilling comments from any external system.

## Roles

Two roles only — unchanged from today:

- `admin`: full access.
- `gast`: can write articles (still need admin approval to publish), can comment.

A new visitor who self-registers becomes a `gast`. Admins can manually edit any user, but there is no separate "promotion" step — the only role transition is `gast` → `admin`, done by editing the user in the admin panel.

## Self-registration

### Flow

1. Visitor goes to `/account/registreren`, fills email + password + display name.
2. Frontend calls Payload's user-create endpoint. Payload creates the user with `role = 'guest'` (label "Gast") and `_verified = false`.
3. Payload sends a verification email (via Resend) with a link containing a token.
4. User clicks link → frontend route `/account/verifieer?token=…` calls Payload's verify endpoint.
5. User can now log in at `/account/inloggen`.

### Payload changes

In `src/collections/Users/index.ts`:

- `access.create`: change from `isAdmin` to `anyone`.
- `auth`: change from `true` to `{ verify: { generateEmailHTML, generateEmailSubject } }` with Dutch copy.
- New `beforeValidate` (or `beforeChange` on `create`) hook: if `req.user` is not an admin, force `role = 'guest'`. This prevents anyone from POSTing `role: admin` during signup. (Throughout this doc, "gast" is the user-facing Dutch label; the role *value* is the existing English `'guest'` to avoid breaking five files that already check it and the Postgres enum.)
- `role` field already has `access.update: isAdminFieldAccess` — keep it; combined with the create-side hook, role is fully locked down for non-admins.
- `name` field: make `required: true` (currently optional) so the signup form has a sensible label everywhere a user is shown.

### Email (Resend)

Add `@payloadcms/email-resend` to dependencies. In `payload.config.ts`:

```ts
import { resendAdapter } from '@payloadcms/email-resend'

email: resendAdapter({
  defaultFromAddress: 'noreply@ronenerik.be', // confirm exact address
  defaultFromName: 'Ron en Erik',
  apiKey: process.env.RESEND_API_KEY || '',
}),
```

Required env vars: `RESEND_API_KEY`. Document in `.env.example`.

Email templates (Dutch):
- **Verification subject:** "Bevestig je e-mailadres voor Ron en Erik"
- **Forgot-password subject:** "Wachtwoord opnieuw instellen"
- HTML templates kept short and brand-consistent (logo, link, plain copy). Implementation can start with Payload defaults translated to Dutch and refine later.

## Articles (no behavioural change)

Existing flow already works:
- `Posts.access.create`: `authenticated` → any logged-in user (including newly verified gasts) can create drafts.
- `Posts.beforeChange` hook strips `_status='published'` and `publishedAt` for non-admins.
- `populateAuthors` ensures the gast is added as an author.

No code changes required for the article side. The only behavioural difference visitors will perceive is that they can now self-register to reach this flow.

## Comments

### Collection: `comments`

Slug: `comments`. Dutch labels: "Reactie" / "Reacties".

**Admin visibility:** hidden from non-admins via `admin.hidden: ({ user }) => user?.role !== 'admin'`. Comments are written and managed on the frontend; the admin panel view is a moderation tool for admins only. Gasts never see the Comments collection in the sidebar, even though they can read comments through the public API (which the frontend uses).

**Fields:**

| Field | Type | Notes |
|---|---|---|
| `post` | relationship → posts | required, indexed |
| `author` | relationship → users | required; auto-set from `req.user` in beforeChange |
| `parent` | relationship → comments | optional; max one level deep (see hook) |
| `content` | richText (Lexical) | required; restricted feature set |
| `editedAt` | date | nullable; set by `beforeChange` when `content` changes after create |
| timestamps | (createdAt/updatedAt) | Payload default |

**Lexical features for `content`:**
`ParagraphFeature`, `BoldFeature`, `ItalicFeature`, `LinkFeature` (URL only — no internal doc picker), and Lexical's default line-break handling. Explicitly: no headings, no images, no blockquotes, no lists, no horizontal rules.

**Indexes:**
- `(post, createdAt)` for the post page query.
- `(author)` for "comments by user" lookups.
- `parent` (FK already implies an index in Postgres but we declare it explicitly for clarity).

### Access control

```ts
access: {
  read: anyone,
  create: ({ req: { user } }) => Boolean(user), // verified is implied: unverified users can't log in
  update: isAuthorWithinEditWindowOrAdmin,
  delete: isAuthorWithinEditWindowOrAdmin,
}
```

`isAuthorWithinEditWindowOrAdmin` returns:
- `true` if admin
- `false` if not logged in
- otherwise a `where` filter: `{ and: [{ author: { equals: user.id } }, { createdAt: { greater_than: <now - 5 min ISO> } }] }`

Editing window is **5 minutes** from `createdAt`.

### Hooks

**`beforeValidate` — enforce one-level threading:**
```ts
if (data.parent) {
  const parent = await req.payload.findByID({ collection: 'comments', id: data.parent, depth: 0 })
  if (parent.parent) {
    throw new ValidationError({ errors: [{ field: 'parent', message: 'Reacties kunnen maar één niveau diep zijn.' }] })
  }
}
```

**`beforeChange` (create) — force author and validate post:**
```ts
if (operation === 'create') {
  data.author = req.user.id
  const post = await req.payload.findByID({ collection: 'posts', id: data.post, depth: 0 })
  if (!post.commentsEnabled) {
    throw new APIError('Reacties zijn uitgeschakeld voor dit artikel.', 403)
  }
}
```

**`beforeChange` (update) — set editedAt:**
```ts
if (operation === 'update' && data.content && JSON.stringify(data.content) !== JSON.stringify(originalDoc.content)) {
  data.editedAt = new Date().toISOString()
}
```

**`afterChange` / `afterDelete` — revalidate the post page:**
Call `revalidatePath` for `/artikels/[slug]` of the related post so SSR'd comments stay fresh.

### Posts: `commentsEnabled`

Add to `src/collections/Posts/index.ts`:

```ts
{
  name: 'commentsEnabled',
  type: 'checkbox',
  label: 'Reacties toestaan',
  defaultValue: true,
  admin: { position: 'sidebar' },
}
```

## Frontend

### Auth pages (under `/account/...`)

- `registreren` — signup form (email, name, password, password confirm). On submit, POST to `/api/users` (Payload's create endpoint, made public via the access change above). On success, show "Check je inbox" screen.
- `inloggen` — login form. POST to `/api/users/login`. On success, redirect to `?redirect=...` or to the homepage.
- `uitloggen` — POST to `/api/users/logout`, redirect home.
- `verifieer` — reads `?token=…`, calls `/api/users/verify/:token`, shows success / error.
- `wachtwoord-vergeten` and `wachtwoord-instellen` — wrap Payload's forgot-password / reset-password.

These are thin client components that hit Payload's existing auth endpoints. No custom route handlers needed.

A small `useUser()` client hook fetches `/api/users/me` once and caches the result for the session, so the UI knows whether to show "Reageren" or "Log in om te reageren".

### Comment thread on `/artikels/[slug]/page.tsx`

Server component:
1. Fetch the post (existing query). If `commentsEnabled === false`, render nothing for the comments section beyond a small "Reacties zijn uitgeschakeld voor dit artikel" notice.
2. Fetch comments: `payload.find({ collection: 'comments', where: { post: { equals: post.id } }, sort: 'createdAt', depth: 1, limit: 200 })`. Group by `parent` to build the two-level structure in memory. (200-comment cap is generous; we can paginate later if needed.)
3. Render a `<CommentThread />` component with:
   - Top-level comments in chronological order.
   - Replies indented under their parent.
   - Each comment shows: author name + avatar, relative date, edited marker if `editedAt`, content rendered from Lexical, and (when applicable) Reply / Edit / Delete buttons.

Client component (`CommentForm`):
- Lexical editor configured with the same restricted feature set as the collection.
- POSTs to `/api/comments` via fetch (Payload REST). On success, calls `router.refresh()` so the server component re-renders the new list. (Acceptable for moderate volume; a later optimization could optimistically insert.)
- Reply form is the same component, just with `parent` pre-filled.

Edit/delete buttons:
- Visible only when `comment.author.id === currentUser.id` AND `Date.now() - new Date(comment.createdAt).getTime() < 5*60*1000`.
- Edit reuses the form. Delete is a confirm dialog → DELETE `/api/comments/:id`.
- Server access control is the source of truth; the UI gating is just polish.

### Reactions UI for logged-out visitors

A single "Log in of maak een account aan om te reageren" link with two buttons. Comments are still readable.

## Migration

Two changes:
1. New `comments` table with `id`, `post_id`, `author_id`, `parent_id` (nullable, FK → comments), `content` (jsonb for Lexical), `edited_at`, `created_at`, `updated_at`. Indexes as listed above.
2. New `comments_enabled` boolean column on `posts`, default `true`.

Generate via `pnpm payload migrate:create` after the collection changes are in. The migration runs automatically on Vercel build (`pnpm build` → `payload migrate` first).

## Security & abuse

- **Spam:** verification + Payload's built-in rate limiting on auth endpoints handles the obvious cases. If we see abuse later we can add an hCaptcha or Turnstile to the registration form.
- **XSS:** Lexical content is rendered through Payload's serializer; no `dangerouslySetInnerHTML` of raw user strings.
- **Mass signup:** Payload's built-in `auth.maxLoginAttempts` already gates login. We rely on that plus Resend's own rate limits for verification email floods.
- **Comment flooding:** out of scope for v1; revisit if it becomes a problem.

## Out of scope (deferred)

- Email notifications when someone replies to your comment.
- Comment editing history.
- Reporting/flagging button for users.
- Block / ban list for malicious users (admin can already delete the user account, which cascades to their comments via FK).
- Markdown shortcuts in the comment editor.
- Pagination of comments beyond the 200-comment cap.

## Files touched (summary)

**New:**
- `src/collections/Comments/index.ts`
- `src/collections/Comments/access/isAuthorWithinEditWindowOrAdmin.ts`
- `src/collections/Comments/hooks/enforceOneLevel.ts`
- `src/collections/Comments/hooks/setAuthorAndValidatePost.ts`
- `src/collections/Comments/hooks/revalidatePostFromComment.ts`
- `src/app/(frontend)/account/registreren/page.tsx`
- `src/app/(frontend)/account/inloggen/page.tsx`
- `src/app/(frontend)/account/uitloggen/page.tsx`
- `src/app/(frontend)/account/verifieer/page.tsx`
- `src/app/(frontend)/account/wachtwoord-vergeten/page.tsx`
- `src/app/(frontend)/account/wachtwoord-instellen/page.tsx`
- `src/components/Comments/CommentThread.tsx`
- `src/components/Comments/CommentForm.tsx`
- `src/components/Comments/CommentItem.tsx`
- `src/hooks/useUser.ts`
- New migration file under `src/migrations/`.

**Modified:**
- `src/collections/Users/index.ts` — open create, add verify, add role-lock hook, name required.
- `src/collections/Posts/index.ts` — add `commentsEnabled` field.
- `src/payload.config.ts` — add `email: resendAdapter(...)`, register `Comments` collection.
- `src/app/(frontend)/artikels/[slug]/page.tsx` — render `<CommentThread />` when `commentsEnabled`.
- `.env.example` — add `RESEND_API_KEY`.
- `package.json` — add `@payloadcms/email-resend`.
