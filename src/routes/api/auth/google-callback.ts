import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import {
  exchangeGoogleCode,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/server/auth/google";
import { parseCookie, generateSecureToken, serializeSessionCookie, SESSION_MAX_AGE_SECONDS } from "@/server/auth/session";
import { errorResponse } from "@/server/api/types";

export const Route = createFileRoute("/api/auth/google-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const origin = url.origin;
          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const oauthError = url.searchParams.get("error");

          if (oauthError) {
            return errorResponse(`Google authentication denied: ${oauthError}`, "OAUTH_DENIED", 400);
          }

          if (!code || !state) {
            return errorResponse("Missing code or state parameter", "INVALID_OAUTH_CALLBACK", 400);
          }

          // 1. Verify Anti-CSRF OAuth State
          const cookieHeader = request.headers.get("cookie");
          const storedState = parseCookie(cookieHeader, GOOGLE_OAUTH_STATE_COOKIE);

          if (!storedState || storedState !== state) {
            return errorResponse(
              "Invalid or expired OAuth state parameter (CSRF detected)",
              "INVALID_OAUTH_STATE",
              403
            );
          }

          // 2. Exchange authorization code with Google
          const googleUser = await exchangeGoogleCode(code, origin);

          // 3. Find or Create User with Safe Account Linking
          const user = await PaddockService.createOrLinkOAuthUser({
            provider: "google",
            providerAccountId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.picture,
          });

          // 4. Issue Persistent Session Cookie
          const token = generateSecureToken();
          const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
          await PaddockService.createSession(user.id, token, expiresAt);

          const sessionCookie = serializeSessionCookie(token);
          const clearStateCookie = `${GOOGLE_OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

          // Handle redirect or JSON based on client request
          const wantsJson = url.searchParams.get("format") === "json";
          if (wantsJson) {
            return Response.json(
              {
                success: true,
                data: { user },
              },
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  "Set-Cookie": `${sessionCookie}, ${clearStateCookie}`,
                },
              }
            );
          }

          // Redirect to profile
          const redirectResponse = new Response(null, {
            status: 302,
            headers: {
              Location: "/profile",
            },
          });
          redirectResponse.headers.append("Set-Cookie", sessionCookie);
          redirectResponse.headers.append("Set-Cookie", clearStateCookie);
          return redirectResponse;
        } catch (err: any) {
          return errorResponse(err?.message || "Google authentication failed", "OAUTH_ERROR", 500);
        }
      },
    },
  },
});
