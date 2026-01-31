DO $$ BEGIN
 CREATE TYPE "company_status" AS ENUM('active', 'paused', 'sold', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "emotional_impact" AS ENUM('very_positive', 'positive', 'neutral', 'negative', 'very_negative');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "goal_category" AS ENUM('faith', 'character', 'health', 'finance', 'business', 'relationships');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "goal_status" AS ENUM('not_started', 'in_progress', 'completed', 'abandoned');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "habit_measurement" AS ENUM('binary', 'count', 'duration', 'scale');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "habit_type" AS ENUM('good', 'bad');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "insight_category" AS ENUM('behavioral', 'financial', 'relationship', 'faith', 'health');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "insight_severity" AS ENUM('info', 'warning', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "investment_type" AS ENUM('stocks', 'bonds', 'crypto', 'real_estate', 'business', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "notification_status" AS ENUM('pending', 'sent', 'failed', 'read');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "notification_type" AS ENUM('routine_reminder', 'reflection_prompt', 'insight_alert', 'accountability_alert', 'birthday', 'goal_milestone');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "permission_scope" AS ENUM('profile', 'identity', 'goals', 'routines', 'habits', 'habits_good', 'habits_bad', 'relationships', 'prayer', 'finance', 'business', 'insights');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "prayer_frequency" AS ENUM('daily', 'weekly', 'monthly', 'as_needed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "prayer_status" AS ENUM('praying', 'answered', 'no_longer_relevant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "relationship_circle" AS ENUM('inner', 'middle', 'outer', 'distant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "relationship_type" AS ENUM('friend', 'family', 'partner', 'potential_partner', 'business_partner', 'ex', 'mentor', 'accountability');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "routine_completion_level" AS ENUM('none', 'minimum', 'ideal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "routine_type" AS ENUM('daily', 'weekly', 'monthly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "time_horizon" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "trust_level" AS ENUM('high', 'medium', 'low', 'none');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('owner', 'point_of_light', 'secondary_user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" varchar(255) NOT NULL,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "company_status" NOT NULL,
	"industry" varchar(255),
	"founded_date" date,
	"closed_date" date,
	"current_revenue" numeric(15, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "faith_commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"commitment_text" text NOT NULL,
	"bible_reading_plan" varchar(255),
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "faith_commitments_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"account_type" varchar(100) NOT NULL,
	"balance" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"due_date" date,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "goal_category" NOT NULL,
	"time_horizon" "time_horizon" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "goal_status" DEFAULT 'not_started' NOT NULL,
	"target_date" date,
	"completed_at" timestamp with time zone,
	"abandoned_at" timestamp with time zone,
	"abandon_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"value" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "habit_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"measurement" "habit_measurement" NOT NULL,
	"target_value" integer,
	"is_active" boolean DEFAULT true,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "insight_category" NOT NULL,
	"severity" "insight_severity" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"actionable_steps" jsonb,
	"is_dismissed" boolean DEFAULT false,
	"dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"interaction_date" timestamp with time zone NOT NULL,
	"summary" text NOT NULL,
	"emotional_impact" "emotional_impact" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "investments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "investment_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(20),
	"quantity" numeric(15, 8),
	"purchase_price" numeric(15, 2),
	"current_price" numeric(15, 2),
	"purchase_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manifestos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "manifestos_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"relationship_type" "relationship_type" NOT NULL,
	"circle" "relationship_circle" NOT NULL,
	"trust_level" "trust_level" NOT NULL,
	"date_of_birth" date,
	"phone_number" varchar(20),
	"email" varchar(255),
	"notes" text,
	"last_contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prayer_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"person_id" uuid,
	"request" text NOT NULL,
	"frequency" "prayer_frequency" NOT NULL,
	"status" "prayer_status" DEFAULT 'praying' NOT NULL,
	"answered_at" timestamp with time zone,
	"answered_details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" date NOT NULL,
	"current_year_theme" varchar(255),
	"current_season_description" text,
	"timezone" varchar(100) DEFAULT 'America/New_York' NOT NULL,
	"notification_preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "revenue_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routine_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"completion_date" date NOT NULL,
	"completion_level" "routine_completion_level" NOT NULL,
	"duration" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routine_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"item_text" varchar(500) NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "routine_type" NOT NULL,
	"target_time" varchar(10),
	"minimum_duration" integer,
	"ideal_duration" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"granted_to_user_id" uuid NOT NULL,
	"scope" "permission_scope" NOT NULL,
	"can_view" boolean DEFAULT false,
	"can_edit" boolean DEFAULT false,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'owner' NOT NULL,
	"webauthn_credentials" jsonb DEFAULT '[]'::jsonb,
	"webauthn_challenge" varchar(255),
	"biometric_enabled" boolean DEFAULT false,
	"last_activity" timestamp with time zone,
	"last_biometric_verification" timestamp with time zone,
	"session_expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"is_locked" boolean DEFAULT false,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"value" varchar(100) NOT NULL,
	"rank" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_logs_user_id" ON "activity_logs" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_logs_action" ON "activity_logs" ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_logs_date" ON "activity_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_companies_user_id" ON "companies" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_companies_status" ON "companies" ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_faith_commitments_user_id" ON "faith_commitments" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_financial_accounts_user_id" ON "financial_accounts" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_goal_milestones_goal_id" ON "goal_milestones" ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_goals_user_id" ON "goals" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_goals_category" ON "goals" ("user_id","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_goals_status" ON "goals" ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_habit_logs_habit_id" ON "habit_logs" ("habit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_habit_logs_date" ON "habit_logs" ("log_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_habit_logs_unique" ON "habit_logs" ("habit_id","log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_habits_user_id" ON "habits" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_habits_type" ON "habits" ("user_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_habits_active" ON "habits" ("user_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_user_id" ON "insights" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_category" ON "insights" ("user_id","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_severity" ON "insights" ("user_id","severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_dismissed" ON "insights" ("user_id","is_dismissed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_interactions_person_id" ON "interactions" ("person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_interactions_date" ON "interactions" ("interaction_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_investments_user_id" ON "investments" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_investments_type" ON "investments" ("user_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_manifestos_user_id" ON "manifestos" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_status" ON "notifications" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_scheduled" ON "notifications" ("scheduled_for");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_people_user_id" ON "people" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_people_circle" ON "people" ("user_id","circle");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_people_type" ON "people" ("user_id","relationship_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prayer_items_user_id" ON "prayer_items" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prayer_items_status" ON "prayer_items" ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prayer_items_person_id" ON "prayer_items" ("person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_subscriptions_user_id" ON "push_subscriptions" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_push_subscriptions_endpoint" ON "push_subscriptions" ("endpoint");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_subscriptions_active" ON "push_subscriptions" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_revenue_logs_company_id" ON "revenue_logs" ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_revenue_logs_date" ON "revenue_logs" ("log_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routine_completions_routine_id" ON "routine_completions" ("routine_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routine_completions_date" ON "routine_completions" ("completion_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_routine_completions_unique" ON "routine_completions" ("routine_id","completion_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routine_items_routine_id" ON "routine_items" ("routine_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routine_items_rank" ON "routine_items" ("routine_id","rank");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routines_user_id" ON "routines" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routines_active" ON "routines" ("user_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_owner_id" ON "user_permissions" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_granted_to" ON "user_permissions" ("granted_to_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_permissions_scope" ON "user_permissions" ("owner_id","granted_to_user_id","scope");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_active" ON "users" ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_session" ON "users" ("id","session_expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_values_user_id" ON "values" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_values_rank" ON "values" ("user_id","rank");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "faith_commitments" ADD CONSTRAINT "faith_commitments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interactions" ADD CONSTRAINT "interactions_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "manifestos" ADD CONSTRAINT "manifestos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "people" ADD CONSTRAINT "people_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prayer_items" ADD CONSTRAINT "prayer_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prayer_items" ADD CONSTRAINT "prayer_items_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "revenue_logs" ADD CONSTRAINT "revenue_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "routine_completions" ADD CONSTRAINT "routine_completions_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "routines" ADD CONSTRAINT "routines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_to_user_id_users_id_fk" FOREIGN KEY ("granted_to_user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "values" ADD CONSTRAINT "values_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
