import { createFileRoute } from "@tanstack/react-router";
import { F1Service } from "@/server/f1/service";

export const Route = createFileRoute("/api/f1/standings")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const type = url.searchParams.get("type") ?? "drivers";
          const season = url.searchParams.get("season") ?? "current";
          const force = url.searchParams.get("refresh") === "true";

          if (type === "constructors") {
            const result = await F1Service.getConstructorStandings(season, force);
            return Response.json(result, {
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=1800",
                "X-Data-Freshness": result.meta.freshness,
                "X-Data-Provider": result.meta.provider,
              },
            });
          }

          const result = await F1Service.getDriverStandings(season, force);
          return Response.json(result, {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=1800",
              "X-Data-Freshness": result.meta.freshness,
              "X-Data-Provider": result.meta.provider,
            },
          });
        } catch (error: any) {
          return Response.json(
            { error: "Failed to retrieve F1 standings", message: error?.message ?? "Unknown error" },
            { status: 500 }
          );
        }
      },
    },
  },
});
