import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add new columns in externalLinks
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "external_links_spotify_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "external_links_discord_url" varchar;
  `)

  // Copy data from socials to externalLinks
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "external_links_spotify_url" = "socials_spotify",
      "external_links_discord_url" = "socials_discord";
  `)

  // Drop old columns
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "socials_spotify";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "socials_discord";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore old columns
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "socials_spotify" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "socials_discord" varchar;
  `)

  // Copy data back
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "socials_spotify" = "external_links_spotify_url",
      "socials_discord" = "external_links_discord_url";
  `)

  // Drop new columns
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "external_links_spotify_url";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "external_links_discord_url";
  `)
}
