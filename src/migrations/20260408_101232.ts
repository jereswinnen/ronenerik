import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  ALTER TABLE "posts_populated_authors" ADD COLUMN "role" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "role" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_posts_status" ADD VALUE 'draft';
  ALTER TYPE "public"."enum_posts_status" ADD VALUE 'published';
  ALTER TYPE "public"."enum__posts_v_version_status" ADD VALUE 'draft';
  ALTER TYPE "public"."enum__posts_v_version_status" ADD VALUE 'published';
  ALTER TABLE "posts_populated_authors" DROP COLUMN "role";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "role";`)
}
