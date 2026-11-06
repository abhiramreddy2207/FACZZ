import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { getSessionTokenFromRequest, serializeClearSessionCookie } from "@/server/auth/session";
import { UpdateProfileSchema, errorResponse, jsonResponse } from "@/server/api/types";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const token = getSessionTokenFromRequest(request);
          if (!token) {
            return errorResponse("Authentication required", "UNAUTHORIZED", 401);
          }

          const auth = await PaddockService.findSessionByToken(token);
          if (!auth) {
            // Token expired or invalid
            return Response.json(
              {
                success: false,
                error: { code: "SESSION_EXPIRED", message: "Session is invalid or has expired" },
              },
              {
                status: 401,
                headers: {
                  "Content-Type": "application/json",
                  "Set-Cookie": serializeClearSessionCookie(),
                },
              }
            );
          }

          const { user } = auth;
          return jsonResponse({
            id: user.id,
            email: user.email,
            name: user.name,
            handle: user.handle,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            badge: user.badge,
            location: user.location,
            favTeam: user.favTeam,
            favDriver: user.favDriver,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
          });
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to retrieve session", "INTERNAL_ERROR", 500);
        }
      },

      PATCH: async ({ request }) => {
        try {
          const token = getSessionTokenFromRequest(request);
          if (!token) {
            return errorResponse("Authentication required", "UNAUTHORIZED", 401);
          }

          const auth = await PaddockService.findSessionByToken(token);
          if (!auth) {
            return errorResponse("Session invalid or expired", "UNAUTHORIZED", 401);
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

          // If updating handle, verify uniqueness
          if (parsed.data.handle && parsed.data.handle !== auth.user.handle) {
            const existingHandle = await PaddockService.findUserByHandle(parsed.data.handle);
            if (existingHandle && existingHandle.id !== auth.user.id) {
              return errorResponse("Handle already taken", "HANDLE_IN_USE", 409);
            }
          }

          const updated = await PaddockService.updateUserProfile(auth.user.id, parsed.data);
          return jsonResponse(updated);
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to update profile", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
