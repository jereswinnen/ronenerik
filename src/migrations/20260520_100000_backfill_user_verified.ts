import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

// Accounts created before email verification was enabled have `_verified = NULL`.
// The JWT auth strategy only authenticates users where `_verified` is truthy, so
// these users could log in but every subsequent request resolved to no user
// (e.g. /api/users/me returned {user:null}). Backfill existing accounts to
// verified. New sign-ups still start as `_verified = false` and must verify by
// email — only NULL (pre-feature) accounts are touched.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "users" SET "_verified" = true WHERE "_verified" IS NULL;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: we cannot know which rows were NULL before, and re-nulling
  // verification status would lock users out again.
}
