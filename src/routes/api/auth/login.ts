import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { LoginSchema, errorResponse } from "@/server/api/types";
import { verifyPassword } from "@/server/auth/passwords";
import { generateSecureToken, serializeSessionCookie, SESSION_MAX_AGE_SECONDS } from "@/server/auth/session";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/server/auth/rate-limit";

export const Route = createFileRoute("/api/auth/login")({
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

          const parsed = LoginSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              422,
              parsed.error.flatten().fieldErrors
            );
          }

          const { email, password } = parsed.data;

          // 1. Rate Limiting Check (Anti-Brute Force)
          const forwardedHeader = request.headers.get("x-forwarded-for");
          const clientIp = forwardedHeader ? forwardedHeader.split(",")[0]?.trim() || "local" : "local";
          const rateLimitKey = `${clientIp}:${email}`;
          const rateCheck = checkRateLimit(rateLimitKey);

          if (!rateCheck.allowed) {
            return Response.json(
              {
                success: false,
                error: {
                  code: "TOO_MANY_ATTEMPTS",
                  message: `Too many login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
                },
              },
              {
                status: 429,
                headers: {
                  "Content-Type": "application/json",
                  "Retry-After": String(rateCheck.retryAfterSeconds || 900),
                },
              }
            );
          }

          // 2. Generic Error Message Helper (Prevents Account Enumeration)
          const genericInvalidResponse = () => {
            recordFailedAttempt(rateLimitKey);
            return errorResponse("Invalid email or password", "INVALID_CREDENTIALS", 401);
          };

          const user = await PaddockService.findUserByEmail(email);
          if (!user) {
            return genericInvalidResponse();
          }

          const account = await PaddockService.findAccountByUserId(user.id, "credentials");
          if (!account || !account.passwordHash) {
            return genericInvalidResponse();
          }

          const isPasswordValid = await verifyPassword(password, account.passwordHash);
          if (!isPasswordValid) {
            return genericInvalidResponse();
          }

          // 3. Clear Rate Limit & Create Session
          resetRateLimit(rateLimitKey);

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
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookieHeader,
              },
            }
          );
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to log in", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
