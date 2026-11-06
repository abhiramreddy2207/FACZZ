import { describe, expect, it } from "vitest";
import { PaddockService } from "@/server/db/service";
import { Route as PostsIndexRoute } from "@/routes/api/posts/index";
import { Route as PostDetailRoute } from "@/routes/api/posts/$id";
import { Route as PostCommentsRoute } from "@/routes/api/posts/$id.comments";
import { Route as PostLikeRoute } from "@/routes/api/posts/$id.like";
import { Route as PostVoteRoute } from "@/routes/api/posts/$id.vote";
import { Route as UserPostsRoute } from "@/routes/api/users/$id.posts";

type RouteHandlers = {
  POST: (ctx: any) => Promise<Response>;
  GET: (ctx: any) => Promise<Response>;
  PATCH: (ctx: any) => Promise<Response>;
  DELETE: (ctx: any) => Promise<Response>;
};

const h = (route: any): RouteHandlers => route.options.server.handlers;

describe("Multi-User Social Platform Architecture (Phase 4)", () => {
  const userA = {
    id: "user-alpha-norris",
    name: "Lando Fanatic",
    handle: "@norris_speed4",
  };

  const userB = {
    id: "user-bravo-piastri",
    name: "Oscar Supporter",
    handle: "@piastri_rookie81",
  };

  // 1. POSTS CRUD & AUTHORIZATION
  describe("Posts Lifecycle & Ownership", () => {
    let createdPostId: string;

    it("creates a new post with category, tags, and media attachment", async () => {
      const req = new Request("http://localhost:3000/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: userA.id,
          category: "Tech Talk",
          title: "MCL38 Sidepod Undercut Analysis",
          content: "Detailed CFD analysis reveals how McLaren channel airflow around the diffuser.",
          tags: ["McLaren", "Aero", "Engineering"],
          teams: ["mclaren"],
          drivers: ["norris"],
          mediaUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7",
        }),
      });

      const res = await h(PostsIndexRoute).POST({ request: req } as any);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe("MCL38 Sidepod Undercut Analysis");
      expect(data.data.category).toBe("Tech Talk");
      expect(data.data.tags).toContain("McLaren");

      createdPostId = data.data.id;
    });

    it("retrieves the post by ID with author details", async () => {
      const res = await h(PostDetailRoute).GET({
        params: { id: createdPostId },
      } as any);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.id).toBe(createdPostId);
      expect(data.data.content).toContain("CFD analysis");
    });

    it("supports pagination and category filtering", async () => {
      const req = new Request("http://localhost:3000/api/posts?category=Tech+Talk&limit=5&offset=0");
      const res = await h(PostsIndexRoute).GET({ request: req } as any);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta.limit).toBe(5);
      expect(data.meta.offset).toBe(0);
      expect(data.data.some((p: any) => p.id === createdPostId)).toBe(true);
    });

    it("allows the genuine author to edit their owned post", async () => {
      const req = new Request(`http://localhost:3000/api/posts/${createdPostId}?userId=${userA.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "MCL38 Sidepod Undercut Revision 2",
          content: "Updated telemetry figures following Friday Practice 2 long runs.",
        }),
      });

      const res = await h(PostDetailRoute).PATCH({
        request: req,
        params: { id: createdPostId },
      } as any);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.title).toBe("MCL38 Sidepod Undercut Revision 2");
      expect(data.data.content).toContain("Friday Practice 2");
    });

    it("prevents an unauthorized user from editing someone else's post (BOLA guard)", async () => {
      const req = new Request(`http://localhost:3000/api/posts/${createdPostId}?userId=${userB.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Malicious Edit By Attacker",
        }),
      });

      const res = await h(PostDetailRoute).PATCH({
        request: req,
        params: { id: createdPostId },
      } as any);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("prevents an unauthorized user from deleting someone else's post", async () => {
      const req = new Request(`http://localhost:3000/api/posts/${createdPostId}?userId=${userB.id}`, {
        method: "DELETE",
      });

      const res = await h(PostDetailRoute).DELETE({
        request: req,
        params: { id: createdPostId },
      } as any);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("allows the author to delete their owned post", async () => {
      const req = new Request(`http://localhost:3000/api/posts/${createdPostId}?userId=${userA.id}`, {
        method: "DELETE",
      });

      const res = await h(PostDetailRoute).DELETE({
        request: req,
        params: { id: createdPostId },
      } as any);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.deleted).toBe(true);

      // Verify it is gone
      const checkRes = await h(PostDetailRoute).GET({
        params: { id: createdPostId },
      } as any);
      expect(checkRes.status).toBe(404);
    });
  });

  // 2. COMMENTS LIFECYCLE & AUTHORIZATION
  describe("Comments Architecture", () => {
    let testPostId: string;
    let commentId: string;

    it("creates comments and validates input constraints", async () => {
      // 1. Setup host post
      const post = await PaddockService.createPost({
        authorId: userA.id,
        category: "Race Debrief",
        content: "Track temperatures will exceed 48 degrees at Lusail.",
        tags: ["QatarGP"],
        teams: ["mclaren"],
      });
      testPostId = post!.id;

      // 2. Reject empty comment
      const invalidReq = new Request(`http://localhost:3000/api/posts/${testPostId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: userB.id,
          content: "",
        }),
      });
      const invalidRes = await h(PostCommentsRoute).POST({
        request: invalidReq,
        params: { id: testPostId },
      } as any);
      expect(invalidRes.status).toBe(422);

      // 3. Post valid comment
      const validReq = new Request(`http://localhost:3000/api/posts/${testPostId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: userB.id,
          content: "Tyre degradation on the front-left will force a mandatory 3-stop strategy.",
        }),
      });
      const validRes = await h(PostCommentsRoute).POST({
        request: validReq,
        params: { id: testPostId },
      } as any);
      expect(validRes.status).toBe(201);

      const commData = await validRes.json();
      expect(commData.data.content).toContain("mandatory 3-stop strategy");
      commentId = commData.data.id;
    });

    it("retrieves comments with author details and timestamps", async () => {
      const req = new Request(`http://localhost:3000/api/posts/${testPostId}/comments`);
      const res = await h(PostCommentsRoute).GET({
        request: req,
        params: { id: testPostId },
      } as any);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0].id).toBe(commentId);
      expect(data.data[0].createdAt).toBeDefined();
    });

    it("prevents an unauthorized user from deleting someone else's comment", async () => {
      const req = new Request(
        `http://localhost:3000/api/posts/${testPostId}/comments?commentId=${commentId}&userId=${userA.id}`,
        { method: "DELETE" }
      );
      const res = await h(PostCommentsRoute).DELETE({
        request: req,
        params: { id: testPostId },
      } as any);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("allows the author to delete their owned comment", async () => {
      const req = new Request(
        `http://localhost:3000/api/posts/${testPostId}/comments?commentId=${commentId}&userId=${userB.id}`,
        { method: "DELETE" }
      );
      const res = await h(PostCommentsRoute).DELETE({
        request: req,
        params: { id: testPostId },
      } as any);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.deleted).toBe(true);
    });
  });

  // 3. LIKES & RECONCILED COUNTERS
  describe("Likes Atomic Toggle & Duplicate Prevention", () => {
    let likePostId: string;

    it("atomically likes and unlikes posts with accurate counts", async () => {
      const post = await PaddockService.createPost({
        authorId: userA.id,
        category: "Hot Take",
        content: "Norris has best tyre preservation in clean air.",
        tags: ["Norris"],
        teams: ["mclaren"],
      });
      likePostId = post!.id;

      // 1. User B likes the post
      const likeReq = new Request(`http://localhost:3000/api/posts/${likePostId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userB.id }),
      });

      const likeRes = await h(PostLikeRoute).POST({
        request: likeReq,
        params: { id: likePostId },
      } as any);
      expect(likeRes.status).toBe(200);
      const likeData = await likeRes.json();
      expect(likeData.data.liked).toBe(true);

      // Verify post like count incremented
      const postAfterLike = await PaddockService.getPostById(likePostId);
      expect(postAfterLike!.likesCount).toBe(1);

      // 2. User B unlikes the post (toggle)
      const unlikeReq = new Request(`http://localhost:3000/api/posts/${likePostId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userB.id }),
      });

      const unlikeRes = await h(PostLikeRoute).POST({
        request: unlikeReq,
        params: { id: likePostId },
      } as any);
      expect(unlikeRes.status).toBe(200);
      const unlikeData = await unlikeRes.json();
      expect(unlikeData.data.liked).toBe(false);

      // Verify post like count decremented
      const postAfterUnlike = await PaddockService.getPostById(likePostId);
      expect(postAfterUnlike!.likesCount).toBe(0);
    });
  });

  // 4. POLLS & ONE VOTE PER USER ENFORCEMENT
  describe("Poll Voting Integrity", () => {
    let pollPostId: string;
    let opt1Id: string;
    let opt2Id: string;

    it("creates poll, registers single vote, and blocks duplicate voting", async () => {
      const post = await PaddockService.createPost({
        authorId: userA.id,
        category: "Paddock Buzz",
        content: "Will McLaren secure Constructors Championship?",
        tags: ["WCC", "McLaren"],
        teams: ["mclaren"],
        poll: {
          question: "Will McLaren win 2026 WCC?",
          options: ["Yes, comfortably", "No, Ferrari will challenge"],
        },
      });
      pollPostId = post!.id;
      opt1Id = post!.poll!.options[0]!.id;
      opt2Id = post!.poll!.options[1]!.id;

      // 1. User A votes Option 1
      const vote1Req = new Request(`http://localhost:3000/api/posts/${pollPostId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userA.id, optionId: opt1Id }),
      });

      const vote1Res = await h(PostVoteRoute).POST({
        request: vote1Req,
        params: { id: pollPostId },
      } as any);
      expect(vote1Res.status).toBe(200);

      // 2. User A tries to vote again on the same poll -> Rejected 409
      const dupeReq = new Request(`http://localhost:3000/api/posts/${pollPostId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userA.id, optionId: opt2Id }),
      });

      const dupeRes = await h(PostVoteRoute).POST({
        request: dupeReq,
        params: { id: pollPostId },
      } as any);
      expect(dupeRes.status).toBe(409);
      const dupeData = await dupeRes.json();
      expect(dupeData.error.code).toBe("ALREADY_VOTED");

      // 3. User B votes Option 2 -> Allowed
      const vote2Req = new Request(`http://localhost:3000/api/posts/${pollPostId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userB.id, optionId: opt2Id }),
      });

      const vote2Res = await h(PostVoteRoute).POST({
        request: vote2Req,
        params: { id: pollPostId },
      } as any);
      expect(vote2Res.status).toBe(200);

      // Verify accurate poll option vote tallies
      const updatedPost = await PaddockService.getPostById(pollPostId);
      expect(updatedPost!.poll!.options[0]!.votes).toBe(1);
      expect(updatedPost!.poll!.options[1]!.votes).toBe(1);
    });
  });

  // 5. USER PROFILES & CROSS-DEVICE SYNCHRONIZATION
  describe("Profiles & Multi-Client Data Consistency", () => {
    it("retrieves user posts filtered by author id", async () => {
      const res = await h(UserPostsRoute).GET({
        request: new Request(`http://localhost:3000/api/users/${userA.id}/posts`),
        params: { id: userA.id },
      } as any);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.every((p: any) => p.authorId === userA.id)).toBe(true);
    });

    it("verifies User A and User B see identical consistent state", async () => {
      // User B creates a post
      const newPost = await PaddockService.createPost({
        authorId: userB.id,
        category: "Meme",
        content: "Oscar radio: 'Yeah, copy.'",
        tags: ["PiastriRadio"],
        teams: ["mclaren"],
      });

      // User A queries community feed
      const feedReq = new Request("http://localhost:3000/api/posts?limit=10");
      const feedRes = await h(PostsIndexRoute).GET({ request: feedReq } as any);
      const feedData = await feedRes.json();

      const foundPost = feedData.data.find((p: any) => p.id === newPost!.id);
      expect(foundPost).toBeDefined();
      expect(foundPost.content).toBe("Oscar radio: 'Yeah, copy.'");
      expect(foundPost.authorId).toBe(userB.id);
    });
  });
});
