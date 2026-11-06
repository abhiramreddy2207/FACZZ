import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { AddCommentSchema, jsonResponse, errorResponse } from "@/server/api/types";
import { getSessionTokenFromRequest } from "@/server/auth/session";

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

          // Authenticate session if token provided
          const token = getSessionTokenFromRequest(request);
          if (token) {
            const auth = await PaddockService.findSessionByToken(token);
            if (auth) {
              body.authorId = auth.user.id;
            }
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

          const url = new URL(request.url);
          let commentId = url.searchParams.get("commentId");

          if (!commentId && request.headers.get("content-type")?.includes("application/json")) {
            try {
              const body = await request.json();
              commentId = body?.commentId;
              if (!requesterId) requesterId = body?.userId;
            } catch {
              // ignore
            }
          }

          if (!requesterId) {
            requesterId = url.searchParams.get("userId") || undefined;
          }

          if (!commentId) {
            return errorResponse("commentId is required", "BAD_REQUEST", 400);
          }

          if (!requesterId) {
            return errorResponse("Authentication required to delete comment", "UNAUTHORIZED", 401);
          }

          const result = await PaddockService.deleteComment(params.id, commentId, requesterId);
          if (!result.success) {
            if (result.reason === "NOT_FOUND") {
              return errorResponse("Comment not found", "NOT_FOUND", 404);
            }
            if (result.reason === "FORBIDDEN") {
              return errorResponse("You are not authorized to delete this comment", "FORBIDDEN", 403);
            }
          }

          return jsonResponse({ deleted: true }, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to delete comment", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
