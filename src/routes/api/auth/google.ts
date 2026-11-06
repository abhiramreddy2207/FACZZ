import { createFileRoute } from "@tanstack/react-router";
import {
  getGoogleConfig,
  generateOAuthState,
  serializeOAuthStateCookie,
  buildGoogleAuthUrl,
} from "@/server/auth/google";
import { errorResponse } from "@/server/api/types";

export const Route = createFileRoute("/api/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const config = getGoogleConfig();
          const url = new URL(request.url);
          const origin = url.origin;

          if (!config.isConfigured) {
            return errorResponse(
              "Google OAuth is not configured on this server. Please define GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
              "GOOGLE_OAUTH_NOT_CONFIGURED",
              503,
              {
                configuredClientId: Boolean(config.clientId),
                configuredSecret: Boolean(config.clientSecret),
              }
            );
          }

          const state = generateOAuthState();
          const authUrl = buildGoogleAuthUrl(origin, state);
          const stateCookie = serializeOAuthStateCookie(state);

          const wantsJson =
            url.searchParams.get("format") === "json" ||
            request.headers.get("accept")?.includes("application/json");

          if (wantsJson) {
            return Response.json(
              { success: true, data: { url: authUrl } },
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  "Set-Cookie": stateCookie,
                },
              }
            );
          }

          return new Response(null, {
            status: 302,
            headers: {
              Location: authUrl,
              "Set-Cookie": stateCookie,
            },
          });
        } catch (err: any) {
          return errorResponse(err?.message || "Failed to initialize Google login", "INTERNAL_ERROR", 500);
        }
      },
    },
  },
});
