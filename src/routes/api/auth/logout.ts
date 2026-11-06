import { createFileRoute } from "@tanstack/react-router";
import { PaddockService } from "@/server/db/service";
import { getSessionTokenFromRequest, serializeClearSessionCookie } from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const token = getSessionTokenFromRequest(request);
          if (token) {
            await PaddockService.deleteSession(token);
          }

          const clearCookie = serializeClearSessionCookie();

          return Response.json(
            { success: true, message: "Logged out successfully" },
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": clearCookie,
              },
            }
          );
        } catch {
          return Response.json(
            { success: true, message: "Logged out" },
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": serializeClearSessionCookie(),
              },
            }
          );
        }
      },
    },
  },
});
