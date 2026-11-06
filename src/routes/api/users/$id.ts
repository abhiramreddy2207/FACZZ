import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { UpdateProfileSchema, jsonResponse, errorResponse } from "@/server/api/types";
import { getSessionTokenFromRequest } from "@/server/auth/session";

export const Route = createFileRoute("/api/users/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const profile = await PaddockService.getUserProfile(params.id);
          if (!profile) {
            return errorResponse("User profile not found", "NOT_FOUND", 404);
          }
          return jsonResponse(profile, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to fetch user profile", "INTERNAL_ERROR", 500);
        }
      },

      PATCH: async ({ request, params }) => {
        try {
          // Verify session if provided
          const token = getSessionTokenFromRequest(request);
          if (token) {
            const auth = await PaddockService.findSessionByToken(token);
            if (!auth || auth.user.id !== params.id) {
              return errorResponse("You are not authorized to update this profile", "FORBIDDEN", 403);
            }
          }

          let body: any;
          try {
            body = await request.json();
          } catch {
            return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
          }

          const parsed = UpdateProfileSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const updated = await PaddockService.updateUserProfile(params.id, parsed.data);
          return jsonResponse(updated, 200);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to update profile", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
