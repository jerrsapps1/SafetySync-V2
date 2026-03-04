CREATE TABLE "admin_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" varchar NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" varchar NOT NULL,
	"note" text NOT NULL,
	"author_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"plan" text DEFAULT 'trial' NOT NULL,
	"billing_status" text DEFAULT 'trial' NOT NULL,
	"trial_end_date" timestamp,
	"onboarding_completed" text DEFAULT 'false' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"country" text DEFAULT 'US',
	"state" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"location_id" varchar,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_billing_overrides" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" varchar NOT NULL,
	"override_type" text DEFAULT 'none' NOT NULL,
	"discount_percent" integer,
	"fixed_price_cents" integer,
	"note" text NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"created_by_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_entitlements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"plan" text DEFAULT 'trial' NOT NULL,
	"billing_source" text DEFAULT 'stripe' NOT NULL,
	"notes" text,
	"ends_at" timestamp,
	"updated_by_user_id" varchar,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "training_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar NOT NULL,
	"training_type" text NOT NULL,
	"osha_standard" text NOT NULL,
	"completion_date" date NOT NULL,
	"expiration_date" date,
	"certificate_url" text,
	"provider" text,
	"status" text DEFAULT 'valid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"full_name" text,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'workspace_user' NOT NULL,
	"company_id" varchar,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_org_id_companies_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_billing_overrides" ADD CONSTRAINT "org_billing_overrides_org_id_companies_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_entitlements" ADD CONSTRAINT "org_entitlements_org_id_companies_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_entitlements" ADD CONSTRAINT "org_entitlements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;