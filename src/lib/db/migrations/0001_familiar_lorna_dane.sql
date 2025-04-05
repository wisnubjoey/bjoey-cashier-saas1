CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed', 'expired');--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'trial';--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"midtrans_order_id" text,
	"midtrans_transaction_id" text,
	"payment_type" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "subscription_status" DEFAULT 'trial' NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"is_trial_used" boolean DEFAULT false,
	"trial_start_date" timestamp,
	"trial_end_date" timestamp,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
