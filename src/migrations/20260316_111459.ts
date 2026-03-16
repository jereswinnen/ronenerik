import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "socials_spotify" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "socials_tiktok" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "socials_spotify";
  ALTER TABLE "site_settings" DROP COLUMN "socials_tiktok";`)
}
