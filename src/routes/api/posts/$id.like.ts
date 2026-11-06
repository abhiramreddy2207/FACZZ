import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { LikePostSchema, jsonResponse, errorResponse } from "@/server/api/types";

export const Route = createFileRoute("/api/posts/$id/like")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          let body: any;
          try {
            body = await request.json();
          } catch {
            return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
          }

          const parsed = LikePostSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const result = await PaddockService.toggleLike(params.id, parsed.data.userId);
          return jsonResponse(result, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to toggle like", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
