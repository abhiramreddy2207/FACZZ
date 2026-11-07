import { createFileRoute } from "@tanstack/react-router";
import { F1Service } from "@/server/f1/service";

export const Route = createFileRoute("/api/f1/health")({
  server: {
    handlers: {
      GET: async () => {
        const health = F1Service.getHealth();
        return Response.json(health, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
