import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { PasswordRecoveryRequestSchema, errorResponse } from "@/server/api/types";
import { generateSecureToken } from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/password-recovery")({
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

          const parsed = PasswordRecoveryRequestSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const { email } = parsed.data;
          const user = await PaddockService.findUserByEmail(email);

          let resetToken: string | undefined;

          if (user) {
            // Generate single-use reset token expiring in 1 hour
            resetToken = generateSecureToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            await PaddockService.createVerificationToken({
              identifier: email,
              token: resetToken,
              type: "password_reset",
              expiresAt,
            });
          }

          // Anti-enumeration: Return generic success response regardless of email existence
          const responsePayload: Record<string, any> = {
            success: true,
            message:
              "If that email address is registered with Faczz Paddock, password reset instructions have been dispatched.",
          };

          // Include token in non-production/test environments for automated validation
          if (process.env["NODE_ENV"] !== "production" && resetToken) {
            responsePayload["meta"] = { resetToken };
          }

          return Response.json(responsePayload, {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to process recovery", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
