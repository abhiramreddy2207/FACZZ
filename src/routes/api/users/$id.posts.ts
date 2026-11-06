import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { jsonResponse, errorResponse } from "@/server/api/types";

export const Route = createFileRoute("/api/users/$id/posts")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const url = new URL(request.url);
          const limit = parseInt(url.searchParams.get("limit") || "20", 10);
          const offset = parseInt(url.searchParams.get("offset") || "0", 10);

          const data = await PaddockService.getPosts({
            limit,
            offset,
            authorId: params.id,
          });

          return jsonResponse(data.posts, 200, {
            limit: data.limit,
            offset: data.offset,
          });
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to fetch user posts", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
