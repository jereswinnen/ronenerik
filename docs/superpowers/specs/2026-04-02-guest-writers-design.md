# Guest Writers — Design Spec

## Overview

Add a `guest` role to the existing Users collection so guest writers can create and edit their own articles without being able to publish, delete, or access admin-only areas of the CMS.

## Data Model Changes

### Users Collection

Add one field:

- `role` — select field with options `admin` and `guest`
  - `defaultValue`: `'admin'`
  - `required`: true
  - Field-level `access.update`: admin only (guests cannot change roles)
  - Position: before the `name` field in the admin UI

Existing users receive `admin` via the default value. No data loss — purely additive.

### Media Collection

Add one field:

- `createdBy` — relationship to `users`
  - Hidden in admin UI
  - Auto-populated via `beforeChange` hook: sets `req.user.id` on document creation
  - Not required — existing media rows will have `null`, treated as admin-owned

### Posts Collection

No new fields. The existing `authors` relationship is used for ownership checks.

### Categories Collection

No new fields.

## Access Control

### New Helpers (in `src/access/`)

| Helper | Logic |
|---|---|
| `isAdmin` | Returns `true` if `req.user.role === 'admin'`, otherwise `false` |
| `isAdminOrSelf` | Admin returns `true`. Guest returns a Payload `where` query scoped to their own documents. Collection-specific: Posts checks `authors` contains user ID, Media checks `createdBy` equals user ID, Users checks document `id` equals user ID |

### Posts

| Operation | Rule |
|---|---|
| Create | `authenticated` (unchanged) |
| Read | Admin: all. Guest: only posts where `authors` contains their user ID. Public: published only |
| Update | Admin: all. Guest: only posts where `authors` contains their user ID |
| Delete | `isAdmin` only |

Field-level restrictions:

- `_status`: `access.update` set to admin only — guests cannot toggle draft/published
- `publishedAt`: `access.update` set to admin only — guests cannot schedule publication

A `beforeChange` hook ensures that a guest author is always included in the `authors` array of their own posts, preventing accidental self-lockout.

### Media

| Operation | Rule |
|---|---|
| Create | `authenticated` (unchanged) |
| Read | `anyone` (unchanged) |
| Update | Admin: all. Guest: only where `createdBy` equals their user ID |
| Delete | Admin: all. Guest: only where `createdBy` equals their user ID |

Existing media with `createdBy: null` is inaccessible to guests for update/delete (effectively admin-owned).

### Categories

| Operation | Rule |
|---|---|
| Create | `authenticated` (guests can create categories) |
| Read | `anyone` (unchanged) |
| Update | `isAdmin` only |
| Delete | `isAdmin` only |

### Users

| Operation | Rule |
|---|---|
| Create | `isAdmin` only |
| Read | Admin: all. Guest: only their own record. Public: unchanged |
| Update | Admin: all. Guest: only their own record (with `role` field locked) |
| Delete | `isAdmin` only |

### Pages

No changes to access logic. Hidden from guest users in admin panel.

### PodcastEpisodes

No changes to access logic. Hidden from guest users in admin panel.

## Admin Panel Restrictions

### Hidden collections for guests

These collections use `admin.hidden` to hide from the sidebar when the user has `role: 'guest'`:

- Pages
- Categories (guests create categories inline from the Posts relationship field, not from the sidebar)
- PodcastEpisodes
- Users

### Hidden globals for guests

- SiteSettings
- PatreonPage

### Guest sidebar

Guests see only:

- **Artikels** — filtered to their own articles
- **Media** — all media visible, but edit/delete restricted to their own uploads

### Guest profile editing

Guests edit their own profile (name, ondertitel, bio, avatar, socials) via the account dropdown in the top-right of the Payload admin panel — not via the Users collection in the sidebar.

## Migration Strategy

One migration adding two columns:

1. `users.role` — text column with default `'admin'`
2. `media.created_by_id` — nullable foreign key to `users.id`

Generated via `pnpm payload migrate:create`. Runs automatically during `pnpm build`.

Existing data is untouched. Zero data loss — purely additive schema changes.

## Edge Cases

- **Autosave**: Works normally for guests. Autosave writes draft content without touching `_status`, which is locked for guests.
- **Existing media**: `createdBy: null` rows are not matchable by guest access queries, so they remain admin-only for edit/delete.
- **Guest self-lockout**: A `beforeChange` hook on Posts prevents guests from removing themselves from the `authors` array.
- **Rating field**: No restriction — guests can set the Ron en Erik rating.
- **Meta/SEO fields**: No restriction — guests can fill these in.

## Files to Change

| File | Change |
|---|---|
| `src/collections/Users/index.ts` | Add `role` field, update access control |
| `src/collections/Posts/index.ts` | Update access (read/update/delete), add field-level access on `_status` and `publishedAt`, add `beforeChange` hook for author self-lockout prevention |
| `src/collections/Media.ts` | Add `createdBy` field + `beforeChange` hook, update access (update/delete) |
| `src/collections/Categories.ts` | Update access (update/delete to admin only) |
| `src/collections/Pages/index.ts` | Add `admin.hidden` for guests |
| `src/collections/PodcastEpisodes/index.ts` | Add `admin.hidden` for guests |
| `src/access/isAdmin.ts` | New file |
| `src/access/isAdminOrSelf.ts` | New file |
| `src/Header/config.ts` or `src/Footer/config.ts` | Add `admin.hidden` for globals if applicable |
| `src/globals/SiteSettings.ts` | Add `admin.hidden` for guests |
| `src/globals/PatreonPage.ts` | Add `admin.hidden` for guests |
| `src/payload-types.ts` | Regenerated via `pnpm generate:types` |
| `src/migrations/` | One new migration file |
