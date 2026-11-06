import {
  type SocialPost,
  type SocialComment,
  getState,
  setState,
} from "./store";

export interface FetchPostsParams {
  limit?: number;
  offset?: number;
  category?: string;
  team?: string;
  authorId?: string;
}

/**
 * Format raw server post to client SocialPost interface
 */
export function formatServerPost(p: any): SocialPost {
  return {
    id: p.id,
    author: {
      id: p.author?.id ?? p.authorId,
      name: p.author?.name ?? "Paddock Member",
      handle: p.author?.handle ?? "@fan",
      avatar: p.author?.avatarUrl ?? p.author?.avatar ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      badge: p.author?.badge ?? "Community Member",
      teamId: p.author?.favTeam,
      isVerified: Boolean(p.author?.badge?.includes("Verified")),
    },
    title: p.title ?? undefined,
    content: p.content,
    mediaUrl: p.mediaUrl ?? undefined,
    category: p.category,
    tags: Array.isArray(p.tags) ? p.tags : [],
    teams: Array.isArray(p.teams) ? p.teams : [],
    drivers: Array.isArray(p.drivers) ? p.drivers : [],
    createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date(p.createdAt).toISOString(),
    likes: p.likesCount ?? p.likes ?? 0,
    reposts: p.repostsCount ?? p.reposts ?? 0,
    poll: p.poll ?? (p.pollOptions && p.pollOptions.length > 0 ? {
      question: p.title || "Paddock Poll",
      options: p.pollOptions.map((o: any) => ({
        id: o.id,
        text: o.text,
        votes: o.votesCount ?? o.votes ?? 0,
      })),
    } : undefined),
  };
}

/**
 * Format raw server comment to client SocialComment interface
 */
export function formatServerComment(c: any): SocialComment {
  return {
    id: c.id,
    postId: c.postId,
    author: {
      id: c.author?.id ?? c.authorId,
      name: c.author?.name ?? "Paddock Fan",
      handle: c.author?.handle ?? "@fan",
      avatar: c.author?.avatarUrl ?? c.author?.avatar,
      teamId: c.author?.favTeam,
    },
    content: c.content,
    createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date(c.createdAt).toISOString(),
    likes: c.likesCount ?? c.likes ?? 0,
  };
}

/**
 * Fetch posts from backend API and sync with client store
 */
export async function syncCommunityPosts(params: FetchPostsParams = {}): Promise<SocialPost[]> {
  try {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));
    if (params.category && params.category !== "All") query.set("category", params.category);
    if (params.team) query.set("team", params.team);
    if (params.authorId) query.set("authorId", params.authorId);

    const res = await fetch(`/api/posts?${query.toString()}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to load community feed");

    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const serverPosts = json.data.map(formatServerPost);

      // Merge into client store
      setState((s) => {
        // Keep non-duplicate posts, prioritizing fresh server records
        const serverMap = new Map(serverPosts.map((p: SocialPost) => [p.id, p]));
        const merged = serverPosts.slice();

        for (const existing of s.userPosts) {
          if (!serverMap.has(existing.id)) {
            merged.push(existing);
          }
        }

        return { userPosts: merged };
      });

      return serverPosts;
    }
  } catch (err) {
    // Return existing local fallback on error
    console.warn("Could not sync community posts from server:", err);
  }

  return getState().userPosts;
}

/**
 * Create a new social post via backend API with optimistic fallback
 */
export async function createCommunityPost(data: {
  title?: string | undefined;
  content: string;
  category: "Paddock Buzz" | "Race Debrief" | "Hot Take" | "Tech Talk" | "Meme";
  tags?: string[] | undefined;
  teams?: string[] | undefined;
  drivers?: string[] | undefined;
  mediaUrl?: string | undefined;
  poll?: { question: string; options: string[] } | undefined;
}): Promise<SocialPost> {
  const current = getState();
  const authorId = current.user?.id || "u-active-paddock-user";

  const payload = {
    authorId,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags || [],
    teams: data.teams || [],
    drivers: data.drivers || [],
    mediaUrl: data.mediaUrl || undefined,
    poll: data.poll,
  };

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      const created = formatServerPost(json.data);
      setState((s) => ({
        userPosts: [created, ...s.userPosts.filter((p) => p.id !== created.id)],
      }));
      return created;
    }
  } catch (err) {
    console.warn("API post creation failed, falling back to local memory:", err);
  }

  // Fallback to local memory creation
  const localPost: SocialPost = {
    id: `p-${Date.now()}`,
    author: {
      id: authorId,
      name: current.user?.name || "Paddock Member",
      handle: current.user?.handle || "@fan",
      avatar: current.user?.avatar,
      badge: current.user?.badge || "Community Member",
      teamId: current.user?.favTeam,
      isVerified: true,
    },
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags || [],
    teams: data.teams || [],
    drivers: data.drivers || [],
    mediaUrl: data.mediaUrl,
    createdAt: new Date().toISOString(),
    likes: 0,
    reposts: 0,
    poll: data.poll
      ? {
          id: `poll-${Date.now()}`,
          question: data.poll.question,
          options: data.poll.options.map((opt, i) => ({
            id: `opt-${Date.now()}-${i}`,
            text: opt,
            votes: 0,
          })),
        }
      : undefined,
  };

  setState((s) => ({
    userPosts: [localPost, ...s.userPosts],
  }));

  return localPost;
}

/**
 * Edit an existing post
 */
export async function editCommunityPost(
  postId: string,
  input: {
    title?: string | undefined;
    content?: string | undefined;
    category?: ("Paddock Buzz" | "Race Debrief" | "Hot Take" | "Tech Talk" | "Meme") | undefined;
    mediaUrl?: string | undefined;
    tags?: string[] | undefined;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update post" };
    }

    const updated = formatServerPost(json.data);
    setState((s) => ({
      userPosts: s.userPosts.map((p) => (p.id === postId ? updated : p)),
    }));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error updating post" };
  }
}

/**
 * Delete an owned post
 */
export async function deleteCommunityPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to delete post" };
    }

    setState((s) => ({
      userPosts: s.userPosts.filter((p) => p.id !== postId),
    }));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error deleting post" };
  }
}

/**
 * Toggle like with optimistic update and server reconciliation
 */
export async function togglePostLike(postId: string): Promise<boolean> {
  const current = getState();
  const userId = current.user?.id || "u-active-paddock-user";
  const wasLiked = current.likes.includes(postId);

  // 1. Optimistic Update
  setState((s) => {
    const newLikes = wasLiked ? s.likes.filter((id) => id !== postId) : [...s.likes, postId];
    const newPosts = s.userPosts.map((p) => {
      if (p.id === postId) {
        return { ...p, likes: Math.max(0, p.likes + (wasLiked ? -1 : 1)) };
      }
      return p;
    });
    return { likes: newLikes, userPosts: newPosts };
  });

  // 2. Server Sync
  try {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId }),
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      const serverLiked = json.data.liked;
      // Reconcile if server differs
      if (serverLiked !== !wasLiked) {
        setState((s) => ({
          likes: serverLiked ? [...s.likes, postId] : s.likes.filter((id) => id !== postId),
        }));
      }
      return serverLiked;
    }
  } catch {
    // Keep optimistic state on network glitch
  }

  return !wasLiked;
}

/**
 * Submit poll vote with optimistic update and duplicate prevention
 */
export async function submitPollVote(postId: string, optionId: string): Promise<{ success: boolean; error?: string }> {
  const current = getState();
  const userId = current.user?.id || "u-active-paddock-user";

  if (current.pollVotes[postId]) {
    return { success: false, error: "You have already voted in this poll" };
  }

  // 1. Optimistic Update
  setState((s) => {
    const newVotes = { ...s.pollVotes, [postId]: optionId };
    const newPosts = s.userPosts.map((p) => {
      if (p.id === postId && p.poll) {
        return {
          ...p,
          poll: {
            ...p.poll,
            options: p.poll.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          },
        };
      }
      return p;
    });
    return { pollVotes: newVotes, userPosts: newPosts };
  });

  // 2. Server Sync
  try {
    const res = await fetch(`/api/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, optionId }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      // Revert optimistic update on server error
      setState((s) => {
        const revertedVotes = { ...s.pollVotes };
        delete revertedVotes[postId];
        const revertedPosts = s.userPosts.map((p) => {
          if (p.id === postId && p.poll) {
            return {
              ...p,
              poll: {
                ...p.poll,
                options: p.poll.options.map((opt) =>
                  opt.id === optionId ? { ...opt, votes: Math.max(0, opt.votes - 1) } : opt
                ),
              },
            };
          }
          return p;
        });
        return { pollVotes: revertedVotes, userPosts: revertedPosts };
      });

      return { success: false, error: json.error?.message || "Failed to submit vote" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: true }; // Keep local on network partition
  }
}

/**
 * Fetch comments for a post
 */
export async function syncPostComments(postId: string): Promise<SocialComment[]> {
  try {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const comments = json.data.map(formatServerComment);
        setState((s) => ({
          comments: {
            ...s.comments,
            [postId]: comments,
          },
        }));
        return comments;
      }
    }
  } catch (err) {
    console.warn("Could not load comments from server:", err);
  }

  return getState().comments[postId] ?? [];
}

/**
 * Add comment to post
 */
export async function addPostComment(postId: string, content: string): Promise<SocialComment> {
  const current = getState();
  const authorId = current.user?.id || "u-active-paddock-user";

  try {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ authorId, content }),
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      const comment = formatServerComment(json.data);
      setState((s) => {
        const postComms = s.comments[postId] ?? [];
        return {
          comments: {
            ...s.comments,
            [postId]: [comment, ...postComms],
          },
        };
      });
      return comment;
    }
  } catch (err) {
    console.warn("API comment creation failed, using local fallback:", err);
  }

  // Local fallback
  const fallbackComment: SocialComment = {
    id: `comm-${Date.now()}`,
    postId,
    author: {
      name: current.user?.name || "Paddock Member",
      handle: current.user?.handle || "@fan",
      avatar: current.user?.avatar,
      teamId: current.user?.favTeam,
    },
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  setState((s) => {
    const postComms = s.comments[postId] ?? [];
    return {
      comments: {
        ...s.comments,
        [postId]: [fallbackComment, ...postComms],
      },
    };
  });

  return fallbackComment;
}

/**
 * Delete a comment from a post
 */
export async function deletePostComment(postId: string, commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/posts/${postId}/comments?commentId=${encodeURIComponent(commentId)}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to delete comment" };
    }

    setState((s) => {
      const list = s.comments[postId] ?? [];
      return {
        comments: {
          ...s.comments,
          [postId]: list.filter((c) => c.id !== commentId),
        },
      };
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error deleting comment" };
  }
}
