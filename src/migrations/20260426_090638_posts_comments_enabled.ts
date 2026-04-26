import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "comments_enabled" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version_comments_enabled" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "comments_enabled";
  ALTER TABLE "_posts_v" DROP COLUMN "version_comments_enabled";`)
}
