import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { CreatePostSchema, jsonResponse, errorResponse } from "@/server/api/types";
import { getSessionTokenFromRequest } from "@/server/auth/session";

export const Route = createFileRoute("/api/posts/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = parseInt(url.searchParams.get("limit") || "20", 10);
          const offset = parseInt(url.searchParams.get("offset") || "0", 10);
          const category = url.searchParams.get("category") || undefined;
          const team = url.searchParams.get("team") || undefined;
          const authorId = url.searchParams.get("authorId") || undefined;

          const data = await PaddockService.getPosts({ limit, offset, category, team, authorId });
          return jsonResponse(data.posts, 200, {
            limit: data.limit,
            offset: data.offset,
          });
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to fetch posts", "INTERNAL_ERROR", 500);
        }
      },

      POST: async ({ request }) => {
        try {
          let body: any;
          try {
            body = await request.json();
          } catch {
            return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
          }

          // Authenticate session if token provided
          const token = getSessionTokenFromRequest(request);
          if (token) {
            const auth = await PaddockService.findSessionByToken(token);
            if (auth) {
              body.authorId = auth.user.id;
            }
          }

          const parsed = CreatePostSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const newPost = await PaddockService.createPost(parsed.data);
          return jsonResponse(newPost, 201);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to create post", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
