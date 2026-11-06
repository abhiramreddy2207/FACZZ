import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { jsonResponse, errorResponse, UpdatePostSchema } from "@/server/api/types";
import { getSessionTokenFromRequest } from "@/server/auth/session";

export const Route = createFileRoute("/api/posts/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const post = await PaddockService.getPostById(params.id);
          if (!post) {
            return errorResponse("Post not found", "NOT_FOUND", 404);
          }
          return jsonResponse(post, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to fetch post", "INTERNAL_ERROR", 500);
        }
      },

      PATCH: async ({ request, params }) => {
        try {
          let requesterId: string | undefined;

          // 1. Check session cookie
          const token = getSessionTokenFromRequest(request);
          if (token) {
            const auth = await PaddockService.findSessionByToken(token);
            if (auth) {
              requesterId = auth.user.id;
            }
          }

          let body: any;
          try {
            body = await request.json();
          } catch {
            return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
          }

          // 2. Fallback to userId in body/query
          if (!requesterId) {
            const url = new URL(request.url);
            requesterId = body?.userId || url.searchParams.get("userId") || undefined;
          }

          if (!requesterId) {
            return errorResponse("Authentication required to edit post", "UNAUTHORIZED", 401);
          }

          const parsed = UpdatePostSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const result = await PaddockService.updatePost(params.id, requesterId, parsed.data);
          if (!result.success) {
            if (result.reason === "NOT_FOUND") {
              return errorResponse("Post not found", "NOT_FOUND", 404);
            }
            if (result.reason === "FORBIDDEN") {
              return errorResponse("You are not authorized to edit this post", "FORBIDDEN", 403);
            }
          }

          return jsonResponse(result.post, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to edit post", "INTERNAL_ERROR", 500);
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          let requesterId: string | undefined;

          // 1. Check session cookie
          const token = getSessionTokenFromRequest(request);
          if (token) {
            const auth = await PaddockService.findSessionByToken(token);
            if (auth) {
              requesterId = auth.user.id;
            }
          }

          // 2. Fallback to userId param
          if (!requesterId) {
            const url = new URL(request.url);
            requesterId = url.searchParams.get("userId") || undefined;
          }

          if (!requesterId) {
            return errorResponse("Authentication required to delete post", "UNAUTHORIZED", 401);
          }

          const result = await PaddockService.deletePost(params.id, requesterId);
          if (!result.success) {
            if (result.reason === "NOT_FOUND") {
              return errorResponse("Post not found", "NOT_FOUND", 404);
            }
            if (result.reason === "FORBIDDEN") {
              return errorResponse("You are not authorized to delete this post", "FORBIDDEN", 403);
            }
          }

          return jsonResponse({ deleted: true }, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to delete post", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
