import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "patreon_heading" varchar DEFAULT 'De extra podcast van deze week';
  ALTER TABLE "site_settings" ADD COLUMN "patreon_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "patreon_cta_text" varchar DEFAULT 'Steun de show';
  ALTER TABLE "site_settings" ADD COLUMN "patreon_patreon_podcast_feed_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "patreon_heading";
  ALTER TABLE "site_settings" DROP COLUMN "patreon_description";
  ALTER TABLE "site_settings" DROP COLUMN "patreon_cta_text";
  ALTER TABLE "site_settings" DROP COLUMN "patreon_patreon_podcast_feed_url";`)
}
