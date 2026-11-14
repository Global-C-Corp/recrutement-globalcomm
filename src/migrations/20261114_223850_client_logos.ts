import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "logo_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_retina_url" varchar,
  	"sizes_retina_width" numeric,
  	"sizes_retina_height" numeric,
  	"sizes_retina_mime_type" varchar,
  	"sizes_retina_filesize" numeric,
  	"sizes_retina_filename" varchar
  );
  
  CREATE TABLE "client_logos_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "client_logos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "logo_media_id" integer;
  ALTER TABLE "client_logos_logos" ADD CONSTRAINT "client_logos_logos_image_id_logo_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."logo_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "client_logos_logos" ADD CONSTRAINT "client_logos_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."client_logos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "logo_media_updated_at_idx" ON "logo_media" USING btree ("updated_at");
  CREATE INDEX "logo_media_created_at_idx" ON "logo_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "logo_media_filename_idx" ON "logo_media" USING btree ("filename");
  CREATE INDEX "logo_media_sizes_retina_sizes_retina_filename_idx" ON "logo_media" USING btree ("sizes_retina_filename");
  CREATE INDEX "client_logos_logos_order_idx" ON "client_logos_logos" USING btree ("_order");
  CREATE INDEX "client_logos_logos_parent_id_idx" ON "client_logos_logos" USING btree ("_parent_id");
  CREATE INDEX "client_logos_logos_image_idx" ON "client_logos_logos" USING btree ("image_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_logo_media_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."logo_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_logo_media_id_idx" ON "payload_locked_documents_rels" USING btree ("logo_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "logo_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "client_logos_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "client_logos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "logo_media" CASCADE;
  DROP TABLE "client_logos_logos" CASCADE;
  DROP TABLE "client_logos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_logo_media_fk";
  
  DROP INDEX "payload_locked_documents_rels_logo_media_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "logo_media_id";`)
}
