import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { jsonResponse, errorResponse } from "@/server/api/types";

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

      DELETE: async ({ request, params }) => {
        try {
          const url = new URL(request.url);
          const requesterId = url.searchParams.get("userId");
          if (!requesterId) {
            return errorResponse("userId is required for authorization", "UNAUTHORIZED", 401);
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
