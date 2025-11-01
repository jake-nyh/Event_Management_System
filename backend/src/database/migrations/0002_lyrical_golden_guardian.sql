ALTER TABLE "events" ADD COLUMN "category" varchar(50);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "tags" varchar(500);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_featured" boolean DEFAULT false;