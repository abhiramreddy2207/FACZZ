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
  accounts: new Map<string, any>(),
  sessions: new Map<string, any>(),
  verificationTokens: new Map<string, any>(),
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

  async deleteComment(postId: string, commentId: string, requesterUserId: string) {
    const db = getDb();
    if (db) {
      const comm = await db.query.comments.findFirst({
        where: and(eq(schema.comments.id, commentId), eq(schema.comments.postId, postId)),
      });
      if (!comm) return { success: false, reason: "NOT_FOUND" };
      if (comm.authorId !== requesterUserId) return { success: false, reason: "FORBIDDEN" };

      await db.delete(schema.comments).where(eq(schema.comments.id, commentId));
      return { success: true };
    }

    const comms = inMemory.comments.get(postId) ?? [];
    const index = comms.findIndex((c) => c.id === commentId);
    if (index === -1) return { success: false, reason: "NOT_FOUND" };
    if (comms[index].authorId !== requesterUserId) return { success: false, reason: "FORBIDDEN" };

    comms.splice(index, 1);
    inMemory.comments.set(postId, comms);
    return { success: true };
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

  // 5. USER PROFILES & AUTHENTICATION
  async getUserProfile(userId: string) {
    const db = getDb();
    if (db) {
      return await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });
    }

    return inMemory.users.get(userId) ?? null;
  },

  async findUserByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const db = getDb();
    if (db) {
      return await db.query.users.findFirst({
        where: eq(schema.users.email, normalized),
      });
    }

    for (const user of inMemory.users.values()) {
      if (user.email && user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  },

  async findUserByHandle(handle: string) {
    const normalized = handle.trim().toLowerCase().replace(/^@/, "");
    const db = getDb();
    if (db) {
      return await db.query.users.findFirst({
        where: eq(schema.users.handle, `@${normalized}`),
      });
    }

    for (const user of inMemory.users.values()) {
      if (user.handle && user.handle.toLowerCase().replace(/^@/, "") === normalized) {
        return user;
      }
    }
    return null;
  },

  async findAccountByUserId(userId: string, provider = "credentials") {
    const db = getDb();
    if (db) {
      return await db.query.accounts.findFirst({
        where: and(eq(schema.accounts.userId, userId), eq(schema.accounts.provider, provider)),
      });
    }

    for (const acc of inMemory.accounts.values()) {
      if (acc.userId === userId && acc.provider === provider) {
        return acc;
      }
    }
    return null;
  },

  async createUserWithCredentials(data: {
    name: string;
    handle: string;
    email: string;
    passwordHash: string;
    favTeam?: string | undefined;
    favDriver?: string | undefined;
    avatarUrl?: string | undefined;
  }) {
    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const accountId = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const normalizedHandle = data.handle.startsWith("@") ? data.handle : `@${data.handle}`;
    const normalizedEmail = data.email.trim().toLowerCase();

    const db = getDb();
    if (db) {
      return await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(schema.users)
          .values({
            id: userId,
            email: normalizedEmail,
            name: data.name,
            handle: normalizedHandle,
            avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            favTeam: data.favTeam || "Scuderia Ferrari",
            favDriver: data.favDriver || "Charles Leclerc",
            badge: "Paddock Member",
          })
          .returning();

        await tx.insert(schema.accounts).values({
          id: accountId,
          userId,
          provider: "credentials",
          providerAccountId: normalizedEmail,
          passwordHash: data.passwordHash,
        });

        return newUser;
      });
    }

    const newUser = {
      id: userId,
      email: normalizedEmail,
      name: data.name,
      handle: normalizedHandle,
      avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      favTeam: data.favTeam || "Scuderia Ferrari",
      favDriver: data.favDriver || "Charles Leclerc",
      badge: "Paddock Member",
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemory.users.set(userId, newUser);
    inMemory.accounts.set(accountId, {
      id: accountId,
      userId,
      provider: "credentials",
      providerAccountId: normalizedEmail,
      passwordHash: data.passwordHash,
      createdAt: new Date(),
    });

    return newUser;
  },

  async createOrLinkOAuthUser(data: {
    provider: string;
    providerAccountId: string;
    email: string;
    name: string;
    avatarUrl?: string | undefined;
  }) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const db = getDb();

    if (db) {
      // 1. Look for existing OAuth account
      const existingAccount = await db.query.accounts.findFirst({
        where: and(
          eq(schema.accounts.provider, data.provider),
          eq(schema.accounts.providerAccountId, data.providerAccountId)
        ),
      });

      if (existingAccount) {
        const user = await db.query.users.findFirst({
          where: eq(schema.users.id, existingAccount.userId),
        });
        if (user) return user;
      }

      // 2. Check if user already exists by email (Safe Account Linking)
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.email, normalizedEmail),
      });

      if (existingUser) {
        // Link this provider account to the existing user
        await db.insert(schema.accounts).values({
          id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: existingUser.id,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        });
        return existingUser;
      }

      // 3. Create fresh user + OAuth account
      return await db.transaction(async (tx) => {
        const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const emailPrefix = data.email.split("@")[0] || "paddock_fan";
        const handle = `@${emailPrefix.replace(/[^a-zA-Z0-9_]/g, "_")}_${Math.random().toString(36).slice(2, 5)}`;

        const [newUser] = await tx
          .insert(schema.users)
          .values({
            id: userId,
            email: normalizedEmail,
            name: data.name,
            handle,
            avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            badge: "Verified Fan",
          })
          .returning();

        await tx.insert(schema.accounts).values({
          id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        });

        return newUser;
      });
    }

    // In-memory fallback
    for (const acc of inMemory.accounts.values()) {
      if (acc.provider === data.provider && acc.providerAccountId === data.providerAccountId) {
        const user = inMemory.users.get(acc.userId);
        if (user) return user;
      }
    }

    for (const user of inMemory.users.values()) {
      if (user.email && user.email.toLowerCase() === normalizedEmail) {
        const accId = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        inMemory.accounts.set(accId, {
          id: accId,
          userId: user.id,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          createdAt: new Date(),
        });
        return user;
      }
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const emailPrefix = data.email.split("@")[0] || "paddock_fan";
    const handle = `@${emailPrefix.replace(/[^a-zA-Z0-9_]/g, "_")}_${Math.random().toString(36).slice(2, 5)}`;
    const newUser = {
      id: userId,
      email: normalizedEmail,
      name: data.name,
      handle,
      avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Fan",
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemory.users.set(userId, newUser);

    const accId = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    inMemory.accounts.set(accId, {
      id: accId,
      userId,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      createdAt: new Date(),
    });

    return newUser;
  },

  // 6. SESSIONS
  async createSession(userId: string, token: string, expiresAt: Date) {
    const sessionId = `ses-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const db = getDb();
    if (db) {
      const [session] = await db
        .insert(schema.sessions)
        .values({
          id: sessionId,
          userId,
          token,
          expiresAt,
        })
        .returning();
      return session;
    }

    const session = {
      id: sessionId,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    inMemory.sessions.set(token, session);
    return session;
  },

  async findSessionByToken(token: string) {
    const db = getDb();
    if (db) {
      const session = await db.query.sessions.findFirst({
        where: eq(schema.sessions.token, token),
      });

      if (!session) return null;
      if (new Date(session.expiresAt) <= new Date()) {
        // Expired - clean up
        await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
        return null;
      }

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, session.userId),
      });
      if (!user) return null;

      return { session, user };
    }

    const session = inMemory.sessions.get(token);
    if (!session) return null;
    if (new Date(session.expiresAt) <= new Date()) {
      inMemory.sessions.delete(token);
      return null;
    }

    const user = inMemory.users.get(session.userId);
    if (!user) return null;

    return { session, user };
  },

  async deleteSession(token: string) {
    const db = getDb();
    if (db) {
      await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
      return;
    }
    inMemory.sessions.delete(token);
  },

  async deleteAllUserSessions(userId: string) {
    const db = getDb();
    if (db) {
      await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
      return;
    }
    for (const [t, s] of inMemory.sessions.entries()) {
      if (s.userId === userId) {
        inMemory.sessions.delete(t);
      }
    }
  },

  // 7. VERIFICATION & PASSWORD RESET TOKENS
  async createVerificationToken(data: {
    identifier: string;
    token: string;
    type: string;
    expiresAt: Date;
  }) {
    const tokenId = `vt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const db = getDb();
    if (db) {
      const [record] = await db
        .insert(schema.verificationTokens)
        .values({
          id: tokenId,
          identifier: data.identifier.toLowerCase(),
          token: data.token,
          type: data.type,
          expiresAt: data.expiresAt,
        })
        .returning();
      return record;
    }

    const record = {
      id: tokenId,
      identifier: data.identifier.toLowerCase(),
      token: data.token,
      type: data.type,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
    inMemory.verificationTokens.set(data.token, record);
    return record;
  },

  async consumeVerificationToken(token: string, type: string) {
    const db = getDb();
    if (db) {
      const record = await db.query.verificationTokens.findFirst({
        where: and(
          eq(schema.verificationTokens.token, token),
          eq(schema.verificationTokens.type, type)
        ),
      });

      if (!record) return null;
      if (new Date(record.expiresAt) <= new Date()) {
        await db.delete(schema.verificationTokens).where(eq(schema.verificationTokens.id, record.id));
        return null;
      }

      await db.delete(schema.verificationTokens).where(eq(schema.verificationTokens.id, record.id));
      return record.identifier;
    }

    const record = inMemory.verificationTokens.get(token);
    if (!record || record.type !== type) return null;
    if (new Date(record.expiresAt) <= new Date()) {
      inMemory.verificationTokens.delete(token);
      return null;
    }

    inMemory.verificationTokens.delete(token);
    return record.identifier;
  },

  async changeUserPassword(userId: string, newPasswordHash: string) {
    const db = getDb();
    if (db) {
      await db
        .update(schema.accounts)
        .set({ passwordHash: newPasswordHash })
        .where(and(eq(schema.accounts.userId, userId), eq(schema.accounts.provider, "credentials")));

      // Invalidate all active sessions for security
      await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
      return true;
    }

    for (const [id, acc] of inMemory.accounts.entries()) {
      if (acc.userId === userId && acc.provider === "credentials") {
        acc.passwordHash = newPasswordHash;
        inMemory.accounts.set(id, acc);
      }
    }

    // Invalidate all sessions
    for (const [t, s] of inMemory.sessions.entries()) {
      if (s.userId === userId) {
        inMemory.sessions.delete(t);
      }
    }
    return true;
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
