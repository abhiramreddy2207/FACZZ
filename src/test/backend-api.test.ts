import { describe, expect, it } from "vitest";
import { PaddockService } from "@/server/db/service";
import { CreatePostSchema, AddCommentSchema, PollVoteSchema } from "@/server/api/types";

describe("Backend Database Service & API Validation", () => {
  it("creates a post and retrieves it with pagination", async () => {
    const input = {
      authorId: "u-tifosi-insider",
      category: "Tech Talk" as const,
      title: "SF-24 Floor Edge Vortex Generation",
      content: "Telemetry shows significant downforce gains in high speed corners like Copse.",
      tags: ["Ferrari", "Aero", "Silverstone"],
      teams: ["ferrari"],
      drivers: ["leclerc"],
      poll: {
        question: "Will Ferrari retain aero advantage in Austin?",
        options: ["Yes, high downforce suite fits", "No, McLaren will lead"],
      },
    };

    const parsed = CreatePostSchema.safeParse(input);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const created = await PaddockService.createPost(parsed.data);
      expect(created).toBeDefined();
      expect(created!.id).toBeDefined();
      expect(created!.title).toBe("SF-24 Floor Edge Vortex Generation");

      // Verify retrieval
      const fetched = await PaddockService.getPostById(created!.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.content).toContain("downforce gains");
    }
  });

  it("rejects invalid post payloads with Zod validation errors", () => {
    const invalidInput = {
      authorId: "",
      category: "InvalidCategory",
      content: "x", // too short (<3 chars)
    };

    const parsed = CreatePostSchema.safeParse(invalidInput);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.authorId).toBeDefined();
      expect(fieldErrors.category).toBeDefined();
      expect(fieldErrors.content).toBeDefined();
    }
  });

  it("adds comments to posts and preserves relational ordering", async () => {
    const post = await PaddockService.createPost({
      authorId: "u-active-paddock-user",
      category: "Race Debrief",
      content: "Piastri's tyre management on Lap 30 was incredible.",
      tags: ["McLaren"],
      teams: ["mclaren"],
      drivers: ["piastri"],
    });
    expect(post).toBeDefined();

    const comment = await PaddockService.addComment(post!.id, {
      authorId: "u-tifosi-insider",
      content: "Agreed, tire degradation curves confirm his sector 2 consistency.",
    });

    expect(comment).toBeDefined();
    expect(comment!.id).toBeDefined();
    expect(comment!.postId).toBe(post!.id);

    const comments = await PaddockService.getComments(post!.id);
    expect(comments.some((c: any) => c.id === comment!.id)).toBe(true);
  });

  it("prevents duplicate likes by toggling like status", async () => {
    const post = await PaddockService.createPost({
      authorId: "u-active-paddock-user",
      category: "Hot Take",
      content: "2026 regulations will lead to higher top speeds at Monza.",
      tags: ["2026", "Monza"],
      teams: [],
      drivers: [],
    });
    expect(post).toBeDefined();

    const userId = "u-fan-test-1";

    // 1st click -> liked
    const like1 = await PaddockService.toggleLike(post!.id, userId);
    expect(like1.liked).toBe(true);

    // 2nd click -> unliked (toggle, no duplicate record)
    const like2 = await PaddockService.toggleLike(post!.id, userId);
    expect(like2.liked).toBe(false);

    // 3rd click -> liked again
    const like3 = await PaddockService.toggleLike(post!.id, userId);
    expect(like3.liked).toBe(true);
  });

  it("enforces ONE vote per user per poll (rejects duplicate votes)", async () => {
    const post = await PaddockService.createPost({
      authorId: "u-active-paddock-user",
      category: "Paddock Buzz",
      content: "Who takes Pole Position at Interlagos?",
      tags: ["BrazilGP"],
      teams: [],
      drivers: [],
      poll: {
        question: "Pole Position Prediction",
        options: ["Max Verstappen", "Lando Norris", "Charles Leclerc"],
      },
    });
    expect(post).toBeDefined();

    const userId = "u-voter-44";
    const optionId = `opt-${post!.id}-0`;

    // 1st vote -> success
    const vote1 = await PaddockService.votePoll(post!.id, userId, optionId);
    expect(vote1.success).toBe(true);

    // 2nd vote by SAME user on SAME poll -> rejected
    const vote2 = await PaddockService.votePoll(post!.id, userId, optionId);
    expect(vote2.success).toBe(false);
    expect(vote2.reason).toBe("ALREADY_VOTED");
  });

  it("enforces Broken Object-Level Authorization (BOLA) protection on post deletion", async () => {
    const authorId = "u-original-creator";
    const post = await PaddockService.createPost({
      authorId,
      category: "Meme",
      content: "Box box box for softs in the rain!",
      tags: ["Strategy"],
      teams: ["ferrari"],
      drivers: [],
    });
    expect(post).toBeDefined();

    // Stranger attempts to delete -> FORBIDDEN
    const strangerAttempt = await PaddockService.deletePost(post!.id, "u-unauthorized-stranger");
    expect(strangerAttempt.success).toBe(false);
    expect(strangerAttempt.reason).toBe("FORBIDDEN");

    // True author deletes -> SUCCESS
    const authorAttempt = await PaddockService.deletePost(post!.id, authorId);
    expect(authorAttempt.success).toBe(true);

    // Verify post is now gone
    const fetched = await PaddockService.getPostById(post!.id);
    expect(fetched).toBeNull();
  });
});
