import { eq, desc, and, sql } from "drizzle-orm";
import { getDb, schema } from "./index";
import { INITIAL_COMMUNITY_POSTS, INITIAL_COMMENTS, DEFAULT_DEMO_USER } from "@/lib/store";
import type { CreatePostSchema, AddCommentSchema, UpdateProfileSchema } from "../api/types";
import { z } from "zod";

// =========================================================
// IN-MEMORY FALLBACK STORE (USED WHEN DATABASE_URL IS UNSET)
// =========================================================
const inMemory = {
  users: new Map<string, any>([
    [DEFAULT_DEMO_USER.id, { ...DEFAULT_DEMO_USER, avatarUrl: DEFAULT_DEMO_USER.avatar }],
  ]),
  posts: new Map<string, any>(
    INITIAL_COMMUNITY_POSTS.map((p) => [
      p.id,
      {
        id: p.id,
        authorId: p.author.id ?? DEFAULT_DEMO_USER.id,
        category: p.category,
        title: p.title,
        content: p.content,
        mediaUrl: p.mediaUrl,
        tags: p.tags,
        teams: p.teams,
        drivers: p.drivers,
        likesCount: p.likes,
        repostsCount: p.reposts,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.createdAt),
        author: {
          id: p.author.id ?? DEFAULT_DEMO_USER.id,
          name: p.author.name,
          handle: p.author.handle,
          avatarUrl: p.author.avatar,
          badge: p.author.badge,
        },
        poll: p.poll,
      },
    ])
  ),
  comments: new Map<string, any[]>(
    Object.entries(INITIAL_COMMENTS).map(([postId, comms]) => [
      postId,
      comms.map((c) => ({
        id: c.id,
        postId: c.postId,
        authorId: DEFAULT_DEMO_USER.id,
        content: c.content,
        likesCount: c.likes,
        createdAt: new Date(c.createdAt),
        author: c.author,
      })),
    ])
  ),
  likes: new Set<string>(["u-active-paddock-user:sp-ferrari-upgrades"]),
  pollVotes: new Map<string, string>(), // "userId:postId" -> optionId
};

// =========================================================
// DATA ACCESS SERVICE
// =========================================================
export const PaddockService = {
  // 1. POSTS
  async getPosts(options: {
    limit?: number | undefined;
    offset?: number | undefined;
    category?: string | undefined;
    team?: string | undefined;
  } = {}) {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
    const offset = Math.max(options.offset ?? 0, 0);
    const db = getDb();

    if (db) {
      const conditions = [];
      if (options.category) conditions.push(eq(schema.posts.category, options.category));

      const rows = await db.query.posts.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit,
        offset,
        orderBy: [desc(schema.posts.createdAt)],
        with: {
          author: true,
          pollOptions: true,
        },
      });

      return {
        posts: rows,
        limit,
        offset,
      };
    }

    // In-memory fallback
    let list = Array.from(inMemory.posts.values());
    if (options.category) list = list.filter((p) => p.category === options.category);
    if (options.team) list = list.filter((p) => p.teams?.includes(options.team));
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      posts: list.slice(offset, offset + limit),
      limit,
      offset,
      total: list.length,
    };
  },

  async getPostById(id: string) {
    const db = getDb();
    if (db) {
      return await db.query.posts.findFirst({
        where: eq(schema.posts.id, id),
        with: {
          author: true,
          pollOptions: true,
          comments: {
            with: { author: true },
            orderBy: [desc(schema.comments.createdAt)],
          },
        },
      });
    }

    const post = inMemory.posts.get(id);
    if (!post) return null;
    const comments = inMemory.comments.get(id) ?? [];
    return { ...post, comments };
  },

  async createPost(input: z.infer<typeof CreatePostSchema>) {
    const db = getDb();
    const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (db) {
      return await db.transaction(async (tx) => {
        const [newPost] = await tx
          .insert(schema.posts)
          .values({
            id: postId,
            authorId: input.authorId,
            category: input.category,
            title: input.title ?? null,
            content: input.content,
            mediaUrl: input.mediaUrl || null,
            tags: input.tags,
            teams: input.teams,
            drivers: input.drivers,
          })
          .returning();

        if (input.poll && input.poll.options.length >= 2) {
          await Promise.all(
            input.poll.options.map((optText, i) =>
              tx.insert(schema.pollOptions).values({
                id: `opt-${postId}-${i}`,
                postId,
                text: optText,
              })
            )
          );
        }

        return newPost;
      });
    }

    // In-memory fallback
    const author = inMemory.users.get(input.authorId) ?? {
      id: input.authorId,
      name: "Paddock Contributor",
      handle: `@fan_${input.authorId.slice(0, 5)}`,
    };

    const newPost = {
      id: postId,
      authorId: input.authorId,
      author,
      category: input.category,
      title: input.title,
      content: input.content,
      mediaUrl: input.mediaUrl,
      tags: input.tags,
      teams: input.teams,
      drivers: input.drivers,
      likesCount: 0,
      repostsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      poll: input.poll
        ? {
            id: `poll-${postId}`,
            question: input.poll.question,
            options: input.poll.options.map((opt, i) => ({
              id: `opt-${postId}-${i}`,
              text: opt,
              votes: 0,
            })),
          }
        : undefined,
    };

    inMemory.posts.set(postId, newPost);
    return newPost;
  },

  async deletePost(id: string, requesterUserId: string) {
    const db = getDb();
    if (db) {
      const post = await db.query.posts.findFirst({
        where: eq(schema.posts.id, id),
      });
      if (!post) return { success: false, reason: "NOT_FOUND" };
      if (post.authorId !== requesterUserId) return { success: false, reason: "FORBIDDEN" };

      await db.delete(schema.posts).where(eq(schema.posts.id, id));
      return { success: true };
    }

    const post = inMemory.posts.get(id);
    if (!post) return { success: false, reason: "NOT_FOUND" };
    if (post.authorId !== requesterUserId) return { success: false, reason: "FORBIDDEN" };

    inMemory.posts.delete(id);
    inMemory.comments.delete(id);
    return { success: true };
  },

  // 2. COMMENTS
  async getComments(postId: string, options: { limit?: number; offset?: number } = {}) {
    const limit = Math.min(Math.max(options.limit ?? 25, 1), 50);
    const offset = Math.max(options.offset ?? 0, 0);
    const db = getDb();

    if (db) {
      return await db.query.comments.findMany({
        where: eq(schema.comments.postId, postId),
        limit,
        offset,
        orderBy: [desc(schema.comments.createdAt)],
        with: { author: true },
      });
    }

    const list = inMemory.comments.get(postId) ?? [];
    return list.slice(offset, offset + limit);
  },

  async addComment(postId: string, input: z.infer<typeof AddCommentSchema>) {
    const db = getDb();
    const commentId = `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    if (db) {
      return await db.transaction(async (tx) => {
        const [comment] = await tx
          .insert(schema.comments)
          .values({
            id: commentId,
            postId,
            authorId: input.authorId,
            content: input.content,
          })
          .returning();
        return comment;
      });
    }

    const author = inMemory.users.get(input.authorId) ?? {
      id: input.authorId,
      name: "Paddock User",
      handle: `@fan_${input.authorId.slice(0, 5)}`,
    };

    const newComment = {
      id: commentId,
      postId,
      authorId: input.authorId,
      author,
      content: input.content,
      likesCount: 0,
      createdAt: new Date(),
    };

    const postComments = inMemory.comments.get(postId) ?? [];
    postComments.push(newComment);
    inMemory.comments.set(postId, postComments);

    return newComment;
  },

  // 3. LIKES (PREVENT DUPLICATES)
  async toggleLike(postId: string, userId: string) {
    const db = getDb();
    if (db) {
      const existing = await db.query.likes.findFirst({
        where: and(eq(schema.likes.userId, userId), eq(schema.likes.postId, postId)),
      });

      if (existing) {
        // Unlike
        await db.delete(schema.likes).where(and(eq(schema.likes.userId, userId), eq(schema.likes.postId, postId)));
        await db
          .update(schema.posts)
          .set({ likesCount: sql`${schema.posts.likesCount} - 1` })
          .where(eq(schema.posts.id, postId));
        return { liked: false };
      } else {
        // Like
        await db.insert(schema.likes).values({ userId, postId });
        await db
          .update(schema.posts)
          .set({ likesCount: sql`${schema.posts.likesCount} + 1` })
          .where(eq(schema.posts.id, postId));
        return { liked: true };
      }
    }

    const key = `${userId}:${postId}`;
    const post = inMemory.posts.get(postId);
    if (inMemory.likes.has(key)) {
      inMemory.likes.delete(key);
      if (post && post.likesCount > 0) post.likesCount--;
      return { liked: false };
    } else {
      inMemory.likes.add(key);
      if (post) post.likesCount++;
      return { liked: true };
    }
  },

  // 4. POLL VOTES (ONE VOTE PER USER PER POLL)
  async votePoll(postId: string, userId: string, optionId: string) {
    const db = getDb();
    if (db) {
      // Check if user already voted
      const existing = await db.query.pollVotes.findFirst({
        where: and(eq(schema.pollVotes.userId, userId), eq(schema.pollVotes.postId, postId)),
      });

      if (existing) {
        return { success: false, reason: "ALREADY_VOTED" };
      }

      await db.transaction(async (tx) => {
        await tx.insert(schema.pollVotes).values({
          id: `vote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId,
          postId,
          optionId,
        });

        await tx
          .update(schema.pollOptions)
          .set({ votesCount: sql`${schema.pollOptions.votesCount} + 1` })
          .where(eq(schema.pollOptions.id, optionId));
      });

      return { success: true };
    }

    const key = `${userId}:${postId}`;
    if (inMemory.pollVotes.has(key)) {
      return { success: false, reason: "ALREADY_VOTED" };
    }

    inMemory.pollVotes.set(key, optionId);
    const post = inMemory.posts.get(postId);
    if (post && post.poll) {
      const opt = post.poll.options.find((o: any) => o.id === optionId);
      if (opt) opt.votes = (opt.votes || 0) + 1;
    }

    return { success: true };
  },

  // 5. USER PROFILES
  async getUserProfile(userId: string) {
    const db = getDb();
    if (db) {
      return await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });
    }

    return inMemory.users.get(userId) ?? null;
  },

  async updateUserProfile(userId: string, input: z.infer<typeof UpdateProfileSchema>) {
    const db = getDb();
    if (db) {
      const [updated] = await db
        .update(schema.users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, userId))
        .returning();
      return updated;
    }

    const user = inMemory.users.get(userId) ?? { id: userId };
    const updated = {
      ...user,
      ...input,
      updatedAt: new Date(),
    };
    inMemory.users.set(userId, updated);
    return updated;
  },
};
