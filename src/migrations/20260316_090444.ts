import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "podcast_episodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "subtitle" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "avatar_url" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "bluesky" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "twitter" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "subtitle" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "avatar_url" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "bluesky" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "twitter" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subtitle" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_id" integer;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "socials_bluesky" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "socials_twitter" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "podcast_episodes_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "podcast_default_episode_image_id" integer;
  DO $$ BEGIN ALTER TABLE "podcast_episodes" ADD CONSTRAINT "podcast_episodes_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE UNIQUE INDEX IF NOT EXISTS "podcast_episodes_slug_idx" ON "podcast_episodes" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "podcast_episodes_featured_image_idx" ON "podcast_episodes" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "podcast_episodes_updated_at_idx" ON "podcast_episodes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "podcast_episodes_created_at_idx" ON "podcast_episodes" USING btree ("created_at");
  DO $$ BEGIN ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_podcast_episodes_fk" FOREIGN KEY ("podcast_episodes_id") REFERENCES "public"."podcast_episodes"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_podcast_default_episode_image_id_media_id_fk" FOREIGN KEY ("podcast_default_episode_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_podcast_episodes_id_idx" ON "payload_locked_documents_rels" USING btree ("podcast_episodes_id");
  CREATE INDEX IF NOT EXISTS "site_settings_podcast_podcast_default_episode_image_idx" ON "site_settings" USING btree ("podcast_default_episode_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "podcast_episodes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "podcast_episodes" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_avatar_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_podcast_episodes_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_podcast_default_episode_image_id_media_id_fk";
  
  DROP INDEX "users_avatar_idx";
  DROP INDEX "payload_locked_documents_rels_podcast_episodes_id_idx";
  DROP INDEX "site_settings_podcast_podcast_default_episode_image_idx";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "subtitle";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "avatar_url";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "bluesky";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "twitter";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "subtitle";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "avatar_url";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "bluesky";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "twitter";
  ALTER TABLE "users" DROP COLUMN "subtitle";
  ALTER TABLE "users" DROP COLUMN "avatar_id";
  ALTER TABLE "users" DROP COLUMN "socials_bluesky";
  ALTER TABLE "users" DROP COLUMN "socials_twitter";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "podcast_episodes_id";
  ALTER TABLE "site_settings" DROP COLUMN "podcast_default_episode_image_id";`)
}
