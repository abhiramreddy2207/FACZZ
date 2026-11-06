CREATE TABLE "accounts" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"provider" varchar(50) DEFAULT 'credentials' NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"post_id" varchar(128) NOT NULL,
	"author_id" varchar(128) NOT NULL,
	"content" text NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" varchar(128) NOT NULL,
	"post_id" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"post_id" varchar(128) NOT NULL,
	"text" varchar(150) NOT NULL,
	"votes_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"post_id" varchar(128) NOT NULL,
	"option_id" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"author_id" varchar(128) NOT NULL,
	"category" varchar(50) NOT NULL,
	"title" varchar(200),
	"content" text NOT NULL,
	"media_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"teams" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"drivers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"reposts_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"handle" varchar(60) NOT NULL,
	"avatar_url" text,
	"bio" text,
	"fav_team" varchar(50),
	"fav_driver" varchar(50),
	"badge" varchar(50) DEFAULT 'Community Member',
	"location" varchar(100) DEFAULT 'Global Paddock',
	"followers_count" integer DEFAULT 0 NOT NULL,
	"following_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "likes_post_idx" ON "likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "poll_options_post_idx" ON "poll_options" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "poll_votes_user_poll_unique" ON "poll_votes" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "poll_votes_option_idx" ON "poll_votes" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_handle_idx" ON "users" USING btree ("handle");