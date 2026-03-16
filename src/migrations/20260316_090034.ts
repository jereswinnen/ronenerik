import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_populated_authors" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN "avatar_url" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN "bluesky" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN "twitter" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "avatar_url" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "bluesky" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "twitter" varchar;
  ALTER TABLE "users" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "users" ADD COLUMN "avatar_id" integer;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP CONSTRAINT "users_avatar_id_media_id_fk";
  
  DROP INDEX "users_avatar_idx";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "subtitle";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "avatar_url";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "bluesky";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "twitter";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "subtitle";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "avatar_url";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "bluesky";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "twitter";
  ALTER TABLE "users" DROP COLUMN "subtitle";
  ALTER TABLE "users" DROP COLUMN "avatar_id";`)
}
