import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =========================================================
// 1. USERS & PROFILES TABLE
// =========================================================
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    handle: varchar("handle", { length: 60 }).notNull().unique(),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    favTeam: varchar("fav_team", { length: 50 }),
    favDriver: varchar("fav_driver", { length: 50 }),
    badge: varchar("badge", { length: 50 }).default("Community Member"),
    location: varchar("location", { length: 100 }).default("Global Paddock"),
    followersCount: integer("followers_count").default(0).notNull(),
    followingCount: integer("following_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_handle_idx").on(table.handle),
  ]
);

// =========================================================
// 2. AUTH ACCOUNTS (CREDENTIALS & OAUTH)
// =========================================================
export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    userId: varchar("user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull().default("credentials"),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("accounts_user_idx").on(table.userId),
    uniqueIndex("accounts_provider_idx").on(table.provider, table.providerAccountId),
  ]
);

// =========================================================
// 3. SESSIONS
// =========================================================
export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    userId: varchar("user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_idx").on(table.token),
    index("sessions_user_idx").on(table.userId),
  ]
);

// =========================================================
// 3B. VERIFICATION & PASSWORD RESET TOKENS
// =========================================================
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    type: varchar("type", { length: 50 }).notNull().default("password_reset"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("verification_tokens_token_idx").on(table.token),
    index("verification_tokens_identifier_idx").on(table.identifier),
  ]
);

// =========================================================
// 4. COMMUNITY POSTS
// =========================================================
export const posts = pgTable(
  "posts",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    authorId: varchar("author_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 50 }).notNull(), // 'Paddock Buzz' | 'Race Debrief' | 'Hot Take' | 'Tech Talk' | 'Meme'
    title: varchar("title", { length: 200 }),
    content: text("content").notNull(),
    mediaUrl: text("media_url"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    teams: jsonb("teams").$type<string[]>().default([]).notNull(),
    drivers: jsonb("drivers").$type<string[]>().default([]).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    repostsCount: integer("reposts_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("posts_author_idx").on(table.authorId),
    index("posts_category_idx").on(table.category),
    index("posts_created_at_idx").on(table.createdAt),
  ]
);

// =========================================================
// 5. COMMENTS
// =========================================================
export const comments = pgTable(
  "comments",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    postId: varchar("post_id", { length: 128 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: varchar("author_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comments_post_idx").on(table.postId),
    index("comments_author_idx").on(table.authorId),
  ]
);

// =========================================================
// 6. LIKES (COMPOSITE UNIQUE CONSTRAINT)
// =========================================================
export const likes = pgTable(
  "likes",
  {
    userId: varchar("user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: varchar("post_id", { length: 128 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.postId] }),
    index("likes_post_idx").on(table.postId),
  ]
);

// =========================================================
// 7. POLL OPTIONS
// =========================================================
export const pollOptions = pgTable(
  "poll_options",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    postId: varchar("post_id", { length: 128 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    text: varchar("text", { length: 150 }).notNull(),
    votesCount: integer("votes_count").default(0).notNull(),
  },
  (table) => [
    index("poll_options_post_idx").on(table.postId),
  ]
);

// =========================================================
// 8. POLL VOTES (1 VOTE PER USER PER POLL)
// =========================================================
export const pollVotes = pgTable(
  "poll_votes",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    userId: varchar("user_id", { length: 128 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: varchar("post_id", { length: 128 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    optionId: varchar("option_id", { length: 128 })
      .notNull()
      .references(() => pollOptions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Enforce 1 vote per user per poll:
    uniqueIndex("poll_votes_user_poll_unique").on(table.userId, table.postId),
    index("poll_votes_option_idx").on(table.optionId),
  ]
);

// =========================================================
// 9. RELATIONS DEFINITIONS
// =========================================================
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  pollVotes: many(pollVotes),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
  pollOptions: many(pollOptions),
  pollVotes: many(pollVotes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  post: one(posts, {
    fields: [pollOptions.postId],
    references: [posts.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [pollVotes.postId],
    references: [posts.id],
  }),
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id],
  }),
}));
