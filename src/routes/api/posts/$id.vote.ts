import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { PollVoteSchema, jsonResponse, errorResponse } from "@/server/api/types";

export const Route = createFileRoute("/api/posts/$id/vote")({
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

          const parsed = PollVoteSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const result = await PaddockService.votePoll(
            params.id,
            parsed.data.userId,
            parsed.data.optionId
          );

          if (!result.success && result.reason === "ALREADY_VOTED") {
            return errorResponse(
              "You have already voted in this poll",
              "ALREADY_VOTED",
              409
            );
          }

          return jsonResponse({ voted: true }, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to submit poll vote", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
