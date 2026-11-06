import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { AddCommentSchema, jsonResponse, errorResponse } from "@/server/api/types";

export const Route = createFileRoute("/api/posts/$id/comments")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const url = new URL(request.url);
          const limit = parseInt(url.searchParams.get("limit") || "25", 10);
          const offset = parseInt(url.searchParams.get("offset") || "0", 10);

          const comments = await PaddockService.getComments(params.id, { limit, offset });
          return jsonResponse(comments, 200, { limit, offset });
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to fetch comments", "INTERNAL_ERROR", 500);
        }
      },

      POST: async ({ request, params }) => {
        try {
          let body: any;
          try {
            body = await request.json();
          } catch {
            return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
          }

          const parsed = AddCommentSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const comment = await PaddockService.addComment(params.id, parsed.data);
          return jsonResponse(comment, 201);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to add comment", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
