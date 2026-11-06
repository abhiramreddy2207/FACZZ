import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { RegisterSchema, errorResponse } from "@/server/api/types";
import { validatePasswordStrength, hashPassword } from "@/server/auth/passwords";
import { generateSecureToken, serializeSessionCookie, SESSION_MAX_AGE_SECONDS } from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/register")({
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

          const parsed = RegisterSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const { name, handle, email, password, favTeam, favDriver } = parsed.data;

          // 1. Password Strength Validation
          const passwordCheck = validatePasswordStrength(password);
          if (!passwordCheck.valid) {
            return errorResponse(
              "Password does not meet security requirements",
              "WEAK_PASSWORD",
              422,
              { errors: passwordCheck.errors }
            );
          }

          // 2. Uniqueness Checks
          const existingEmail = await PaddockService.findUserByEmail(email);
          if (existingEmail) {
            return errorResponse(
              "An account with this email address already exists",
              "EMAIL_IN_USE",
              409
            );
          }

          const existingHandle = await PaddockService.findUserByHandle(handle);
          if (existingHandle) {
            return errorResponse(
              "This paddock handle is already taken",
              "HANDLE_IN_USE",
              409
            );
          }

          // 3. Hash Password & Create User
          const passwordHash = await hashPassword(password);
          const user = await PaddockService.createUserWithCredentials({
            name,
            handle,
            email,
            passwordHash,
            favTeam,
            favDriver,
          });

          if (!user) {
            return errorResponse("Failed to create user account", "INTERNAL_ERROR", 500);
          }

          // 4. Issue Persistent Session Cookie
          const token = generateSecureToken();
          const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
          await PaddockService.createSession(user.id, token, expiresAt);

          const cookieHeader = serializeSessionCookie(token);

          return Response.json(
            {
              success: true,
              data: {
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  handle: user.handle,
                  avatarUrl: user.avatarUrl,
                  badge: user.badge,
                  favTeam: user.favTeam,
                  favDriver: user.favDriver,
                },
              },
            },
            {
              status: 201,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookieHeader,
              },
            }
          );
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to register user", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
