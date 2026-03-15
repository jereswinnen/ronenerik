import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "podcast_episodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"featured_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "podcast_episodes_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "podcast_default_episode_image_id" integer;
  ALTER TABLE "podcast_episodes" ADD CONSTRAINT "podcast_episodes_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "podcast_episodes_slug_idx" ON "podcast_episodes" USING btree ("slug");
  CREATE INDEX "podcast_episodes_featured_image_idx" ON "podcast_episodes" USING btree ("featured_image_id");
  CREATE INDEX "podcast_episodes_updated_at_idx" ON "podcast_episodes" USING btree ("updated_at");
  CREATE INDEX "podcast_episodes_created_at_idx" ON "podcast_episodes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_podcast_episodes_fk" FOREIGN KEY ("podcast_episodes_id") REFERENCES "public"."podcast_episodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_podcast_default_episode_image_id_media_id_fk" FOREIGN KEY ("podcast_default_episode_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_podcast_episodes_id_idx" ON "payload_locked_documents_rels" USING btree ("podcast_episodes_id");
  CREATE INDEX "site_settings_podcast_podcast_default_episode_image_idx" ON "site_settings" USING btree ("podcast_default_episode_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "podcast_episodes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "podcast_episodes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_podcast_episodes_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_podcast_default_episode_image_id_media_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_podcast_episodes_id_idx";
  DROP INDEX "site_settings_podcast_podcast_default_episode_image_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "podcast_episodes_id";
  ALTER TABLE "site_settings" DROP COLUMN "podcast_default_episode_image_id";`)
}
