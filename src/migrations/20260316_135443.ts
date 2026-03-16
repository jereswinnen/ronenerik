import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "posts_populated_authors" ADD COLUMN "bio" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN "instagram" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "bio" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "instagram" varchar;
  ALTER TABLE "users" ADD COLUMN "bio" varchar;
  ALTER TABLE "users" ADD COLUMN "socials_instagram" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "about_heading" varchar DEFAULT 'Wij zijn Ron en Erik';
  ALTER TABLE "site_settings" ADD COLUMN "about_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "about_image_id" integer;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_users_id_idx" ON "site_settings_rels" USING btree ("users_id");
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_about_image_id_media_id_fk" FOREIGN KEY ("about_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_about_about_image_idx" ON "site_settings" USING btree ("about_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_rels" CASCADE;
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_about_image_id_media_id_fk";
  
  DROP INDEX "site_settings_about_about_image_idx";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "bio";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "instagram";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "bio";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "instagram";
  ALTER TABLE "users" DROP COLUMN "bio";
  ALTER TABLE "users" DROP COLUMN "socials_instagram";
  ALTER TABLE "site_settings" DROP COLUMN "about_heading";
  ALTER TABLE "site_settings" DROP COLUMN "about_description";
  ALTER TABLE "site_settings" DROP COLUMN "about_image_id";`)
}
