CREATE TABLE "user_daily_activity" (
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "user_daily_activity_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"streak_freeze" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"completed_lessons" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_unit_progress" (
	"user_id" text NOT NULL,
	"unit_id" text NOT NULL,
	"mastery" integer DEFAULT 0 NOT NULL,
	"mastery_updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_unit_progress_user_id_unit_id_pk" PRIMARY KEY("user_id","unit_id")
);
--> statement-breakpoint
ALTER TABLE "user_daily_activity" ADD CONSTRAINT "user_daily_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_unit_progress" ADD CONSTRAINT "user_unit_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;