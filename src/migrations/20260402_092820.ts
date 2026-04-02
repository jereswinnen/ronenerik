import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_rating" AS ENUM('1', '2', '3', '4', '5', '6', '7', '7.5', '8', '9', '10');
  CREATE TYPE "public"."enum__posts_v_version_rating" AS ENUM('1', '2', '3', '4', '5', '6', '7', '7.5', '8', '9', '10');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'guest');
  ALTER TYPE "public"."enum_posts_status" ADD VALUE 'draft';
  ALTER TYPE "public"."enum_posts_status" ADD VALUE 'published';
  ALTER TYPE "public"."enum__posts_v_version_status" ADD VALUE 'draft';
  ALTER TYPE "public"."enum__posts_v_version_status" ADD VALUE 'published';
  CREATE TABLE "patreon_page_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "patreon_page_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" varchar NOT NULL,
  	"description" varchar,
  	"cta_text" varchar NOT NULL,
  	"highlighted" boolean DEFAULT false
  );
  
  CREATE TABLE "patreon_page_formats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "patreon_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_heading" varchar DEFAULT 'Kies voor hoeveel je ons wil steunen',
  	"hero_social_proof" varchar DEFAULT '100+ luisteraars gingen je voor',
  	"formats_heading" varchar DEFAULT 'Onze gevierde Patreon formats',
  	"formats_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  ALTER TABLE "posts" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "posts" ADD COLUMN "rating" "enum_posts_rating";
  ALTER TABLE "_posts_v" ADD COLUMN "version_subtitle" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_rating" "enum__posts_v_version_rating";
  ALTER TABLE "media" ADD COLUMN "created_by_id" integer;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'admin' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "external_links_spotify_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "external_links_discord_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "external_links_unpause_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "external_links_patreon_podcast_feed_url" varchar;
  ALTER TABLE "patreon_page_plans_features" ADD CONSTRAINT "patreon_page_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."patreon_page_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "patreon_page_plans" ADD CONSTRAINT "patreon_page_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."patreon_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "patreon_page_formats_items" ADD CONSTRAINT "patreon_page_formats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."patreon_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "patreon_page" ADD CONSTRAINT "patreon_page_formats_image_id_media_id_fk" FOREIGN KEY ("formats_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "patreon_page_plans_features_order_idx" ON "patreon_page_plans_features" USING btree ("_order");
  CREATE INDEX "patreon_page_plans_features_parent_id_idx" ON "patreon_page_plans_features" USING btree ("_parent_id");
  CREATE INDEX "patreon_page_plans_order_idx" ON "patreon_page_plans" USING btree ("_order");
  CREATE INDEX "patreon_page_plans_parent_id_idx" ON "patreon_page_plans" USING btree ("_parent_id");
  CREATE INDEX "patreon_page_formats_items_order_idx" ON "patreon_page_formats_items" USING btree ("_order");
  CREATE INDEX "patreon_page_formats_items_parent_id_idx" ON "patreon_page_formats_items" USING btree ("_parent_id");
  CREATE INDEX "patreon_page_formats_formats_image_idx" ON "patreon_page" USING btree ("formats_image_id");
  ALTER TABLE "media" ADD CONSTRAINT "media_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_created_by_idx" ON "media" USING btree ("created_by_id");
  ALTER TABLE "site_settings" DROP COLUMN "patreon_heading";
  ALTER TABLE "site_settings" DROP COLUMN "patreon_description";
  ALTER TABLE "site_settings" DROP COLUMN "patreon_cta_text";
  ALTER TABLE "site_settings" DROP COLUMN "patreon_patreon_podcast_feed_url";
  ALTER TABLE "site_settings" DROP COLUMN "socials_discord";
  ALTER TABLE "site_settings" DROP COLUMN "socials_spotify";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  ALTER TABLE "patreon_page_plans_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "patreon_page_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "patreon_page_formats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "patreon_page" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "patreon_page_plans_features" CASCADE;
  DROP TABLE "patreon_page_plans" CASCADE;
  DROP TABLE "patreon_page_formats_items" CASCADE;
  DROP TABLE "patreon_page" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_created_by_id_users_id_fk";
  
  ALTER TABLE "posts" ALTER COLUMN "_status" SET DATA TYPE text;
  ALTER TABLE "posts" ALTER COLUMN "_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_posts_status";
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  ALTER TABLE "posts" ALTER COLUMN "_status" SET DEFAULT 'draft'::"public"."enum_posts_status";
  ALTER TABLE "posts" ALTER COLUMN "_status" SET DATA TYPE "public"."enum_posts_status" USING "_status"::"public"."enum_posts_status";
  ALTER TABLE "_posts_v" ALTER COLUMN "version__status" SET DATA TYPE text;
  ALTER TABLE "_posts_v" ALTER COLUMN "version__status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum__posts_v_version_status";
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  ALTER TABLE "_posts_v" ALTER COLUMN "version__status" SET DEFAULT 'draft'::"public"."enum__posts_v_version_status";
  ALTER TABLE "_posts_v" ALTER COLUMN "version__status" SET DATA TYPE "public"."enum__posts_v_version_status" USING "version__status"::"public"."enum__posts_v_version_status";
  DROP INDEX "media_created_by_idx";
  ALTER TABLE "site_settings" ADD COLUMN "patreon_heading" varchar DEFAULT 'De extra podcast van deze week';
  ALTER TABLE "site_settings" ADD COLUMN "patreon_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "patreon_cta_text" varchar DEFAULT 'Steun de show';
  ALTER TABLE "site_settings" ADD COLUMN "patreon_patreon_podcast_feed_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "socials_discord" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "socials_spotify" varchar;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  ALTER TABLE "posts" DROP COLUMN "subtitle";
  ALTER TABLE "posts" DROP COLUMN "rating";
  ALTER TABLE "_posts_v" DROP COLUMN "version_subtitle";
  ALTER TABLE "_posts_v" DROP COLUMN "version_rating";
  ALTER TABLE "media" DROP COLUMN "created_by_id";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "site_settings" DROP COLUMN "external_links_spotify_url";
  ALTER TABLE "site_settings" DROP COLUMN "external_links_discord_url";
  ALTER TABLE "site_settings" DROP COLUMN "external_links_unpause_url";
  ALTER TABLE "site_settings" DROP COLUMN "external_links_patreon_podcast_feed_url";
  DROP TYPE "public"."enum_posts_rating";
  DROP TYPE "public"."enum__posts_v_version_rating";
  DROP TYPE "public"."enum_users_role";`)
}
