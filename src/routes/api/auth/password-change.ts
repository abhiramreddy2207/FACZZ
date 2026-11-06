import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { PasswordChangeSchema, errorResponse } from "@/server/api/types";
import { validatePasswordStrength, hashPassword, verifyPassword } from "@/server/auth/passwords";
import { getSessionTokenFromRequest, generateSecureToken, serializeSessionCookie, SESSION_MAX_AGE_SECONDS } from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/password-change")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

          const parsed = PasswordChangeSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const { currentPassword, newPassword } = parsed.data;

          // 1. Verify Current Password
          const account = await PaddockService.findAccountByUserId(auth.user.id, "credentials");
          if (!account || !account.passwordHash) {
            return errorResponse(
              "Account does not have a credentials password set (e.g. registered with OAuth)",
              "NO_PASSWORD_ACCOUNT",
              400
            );
          }

          const currentValid = await verifyPassword(currentPassword, account.passwordHash);
          if (!currentValid) {
            return errorResponse("Current password is incorrect", "INCORRECT_PASSWORD", 403);
          }

          // 2. Validate New Password Strength
          const strength = validatePasswordStrength(newPassword);
          if (!strength.valid) {
            return errorResponse(
              "New password does not meet security requirements",
              "WEAK_PASSWORD",
              422,
              { errors: strength.errors }
            );
          }

          // 3. Hash New Password & Invalidate Old Sessions
          const newPasswordHash = await hashPassword(newPassword);
          await PaddockService.changeUserPassword(auth.user.id, newPasswordHash);

          // 4. Issue Fresh Rotated Session for Current User
          const newToken = generateSecureToken();
          const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
          await PaddockService.createSession(auth.user.id, newToken, expiresAt);

          const cookieHeader = serializeSessionCookie(newToken);

          return Response.json(
            {
              success: true,
              message: "Password changed successfully. Active sessions rotated.",
            },
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookieHeader,
              },
            }
          );
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to change password", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
