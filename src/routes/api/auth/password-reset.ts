import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { PasswordResetSchema, errorResponse } from "@/server/api/types";
import { validatePasswordStrength, hashPassword } from "@/server/auth/passwords";

export const Route = createFileRoute("/api/auth/password-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let body: any;
          try {
            body = await request.json();
          } catch {
            return errorResponse("Invalid JSON payload", "INVALID_JSON", 400);
          }

          const parsed = PasswordResetSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const { token, password } = parsed.data;

          // 1. Validate Password Strength
          const strength = validatePasswordStrength(password);
          if (!strength.valid) {
            return errorResponse(
              "Password does not meet security requirements",
              "WEAK_PASSWORD",
              422,
              { errors: strength.errors }
            );
          }

          // 2. Consume Token (Single use)
          const email = await PaddockService.consumeVerificationToken(token, "password_reset");
          if (!email) {
            return errorResponse(
              "Invalid or expired password reset token",
              "INVALID_TOKEN",
              400
            );
          }

          const user = await PaddockService.findUserByEmail(email);
          if (!user) {
            return errorResponse("Associated user account not found", "USER_NOT_FOUND", 404);
          }

          // 3. Hash New Password & Invalidate Old Sessions
          const newPasswordHash = await hashPassword(password);
          await PaddockService.changeUserPassword(user.id, newPasswordHash);

          return Response.json(
            {
              success: true,
              message: "Password has been successfully reset. Please log in with your new credentials.",
            },
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to reset password", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
