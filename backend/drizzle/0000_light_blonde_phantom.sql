CREATE TYPE "public"."priority_enum" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."status_enum" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "ticket_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"content" text NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"organization_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" "status_enum" DEFAULT 'open' NOT NULL,
	"priority" "priority_enum",
	"category" varchar(100),
	"reporter_name" varchar(255) NOT NULL,
	"reporter_email" varchar(255) NOT NULL,
	"assignee_id" varchar(255),
	"organization_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_reporter_email_unique" UNIQUE("reporter_email")
);
--> statement-breakpoint
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;