import { createFileRoute } from "@tanstack/react-router";
import { F1Service } from "@/server/f1/service";

export const Route = createFileRoute("/api/f1/live")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const [timingResult, weatherResult] = await Promise.all([
            F1Service.getLiveTiming(),
            F1Service.getTrackWeather(),
          ]);

          const payload = {
            timing: timingResult.data,
            weather: weatherResult.data,
            meta: {
              timing: timingResult.meta,
              weather: weatherResult.meta,
              freshness: timingResult.meta.freshness,
              updatedAt: new Date().toISOString(),
            },
          };

          return Response.json(payload, {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=10, s-maxage=10, stale-while-revalidate=60",
              "X-Data-Freshness": timingResult.meta.freshness,
            },
          });
        } catch (error: any) {
          return Response.json(
            { error: "Failed to retrieve live telemetry", message: error?.message ?? "Unknown error" },
            { status: 500 }
          );
        }
      },
    },
  },
});
