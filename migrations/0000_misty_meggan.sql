CREATE TABLE "attorney_fee_schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"attorney_id" integer NOT NULL,
	"case_type_id" integer NOT NULL,
	"fee" integer NOT NULL,
	"fee_type" varchar(50) DEFAULT 'flat' NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attorney_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"attorney_id" integer NOT NULL,
	"assignment_id" integer,
	"case_id" integer,
	"note" text NOT NULL,
	"is_private" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attorneys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(50),
	"bar_number" varchar(100),
	"license_state" varchar(50),
	"practice_areas" text[],
	"years_of_experience" integer,
	"hourly_rate" integer,
	"firm_name" varchar(255),
	"firm_address" text,
	"bio" text,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attorneys_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"image_url" text,
	"image_alt" varchar(255),
	"is_featured" boolean DEFAULT false,
	"spanish_title" varchar(255),
	"spanish_content" text,
	"spanish_excerpt" text,
	"translation_status" varchar(50) DEFAULT 'pending',
	"author_id" integer NOT NULL,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "case_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL,
	"label_es" varchar(255),
	"description" text NOT NULL,
	"description_es" text,
	"category" varchar(255),
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "case_types_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"quote_id" integer NOT NULL,
	"case_number" varchar(20) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"completed_date" timestamp,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "chatbot_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"prompt" text NOT NULL,
	"initial_greeting" text,
	"description" text,
	"language" text DEFAULT 'en' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"to_address" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"template_type" text NOT NULL,
	"variables" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"use_in_production" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "information_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"client_response" text,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "legal_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_number" varchar(10) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(50),
	"case_type" varchar(255) NOT NULL,
	"case_description" text NOT NULL,
	"location" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"captcha" varchar(10),
	"agree_to_terms" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'under_review' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "legal_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"content" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"service_fee" integer NOT NULL,
	"description" text NOT NULL,
	"terms" text,
	"valid_until" timestamp,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"attorney_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'assigned' NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request_attorney_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"attorney_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'assigned' NOT NULL,
	"notes" text,
	"email_sent" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smtp_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"configuration_name" text DEFAULT 'SMTP2GO' NOT NULL,
	"smtp_host" text DEFAULT 'mail.smtp2go.com' NOT NULL,
	"smtp_port" integer DEFAULT 2525 NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"from_email" text NOT NULL,
	"from_name" text DEFAULT 'LinkToLawyers' NOT NULL,
	"use_ssl" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "structured_intakes" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_number" varchar(10) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"case_type" varchar(50) NOT NULL,
	"role" varchar(20),
	"form_responses" text NOT NULL,
	"attorney_intake_summary" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "structured_intakes_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'client' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attorney_fee_schedule" ADD CONSTRAINT "attorney_fee_schedule_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorney_fee_schedule" ADD CONSTRAINT "attorney_fee_schedule_case_type_id_case_types_id_fk" FOREIGN KEY ("case_type_id") REFERENCES "public"."case_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorney_notes" ADD CONSTRAINT "attorney_notes_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorney_notes" ADD CONSTRAINT "attorney_notes_assignment_id_referral_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."referral_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorney_notes" ADD CONSTRAINT "attorney_notes_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorneys" ADD CONSTRAINT "attorneys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_assignment_id_referral_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."referral_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "information_requests" ADD CONSTRAINT "information_requests_assignment_id_referral_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."referral_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_assignment_id_referral_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."referral_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_assignments" ADD CONSTRAINT "referral_assignments_request_id_legal_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."legal_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_assignments" ADD CONSTRAINT "referral_assignments_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_attorney_assignments" ADD CONSTRAINT "request_attorney_assignments_request_id_legal_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."legal_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_attorney_assignments" ADD CONSTRAINT "request_attorney_assignments_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE cascade ON UPDATE no action;