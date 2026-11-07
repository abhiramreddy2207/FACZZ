import { describe, expect, it, beforeEach } from "vitest";
import { datasets, getDataset } from "@/lib/data-catalog";
import { F1DataCache } from "@/server/f1/cache";
import { F1Service } from "@/server/f1/service";
import { normalizeDriverId, normalizeConstructorId } from "@/server/f1/mappings";
import { Route as StandingsRoute } from "@/routes/api/f1/standings";
import { Route as LiveRoute } from "@/routes/api/f1/live";
import { Route as HealthRoute } from "@/routes/api/f1/health";

type RouteHandlers = {
  GET?: (ctx: { request: Request; params?: any }) => Promise<Response>;
};

const h = (route: any): RouteHandlers => (route.options as any).server.handlers;

describe("Phase 5: F1 Telemetry Architecture & Catalog Integrity", () => {
  it("preserves all 16 required telemetry datasets", () => {
    expect(datasets).toHaveLength(16);
    const expectedSlugs = [
      "live-timing",
      "schedule",
      "results",
      "driver-standings",
      "constructor-standings",
      "drivers",
      "teams",
      "driver-stats",
      "head-to-head",
      "consistency",
      "race-pace",
      "pit-stops",
      "tech-updates",
      "used-elements",
      "destructors-championship",
      "track-dna",
    ];
    expect(datasets.map((d) => d.slug)).toEqual(expectedSlugs);
  });

  it("verifies every telemetry dataset has valid attributed sources and rows", () => {
    for (const ds of datasets) {
      expect(ds.rows().length).toBeGreaterThan(0);
      expect(ds.providerUrl.startsWith("https://")).toBe(true);
      expect(Number.isNaN(Date.parse(ds.updated))).toBe(false);
      expect(ds.label.length).toBeGreaterThan(0);
      expect(ds.columns.length).toBeGreaterThan(0);
    }
  });
});

describe("Phase 5: Ergast & OpenF1 ID Normalization", () => {
  it("normalizes external driver IDs to Faczz catalog identifiers", () => {
    expect(normalizeDriverId("max_verstappen")).toBe("verstappen");
    expect(normalizeDriverId("norris")).toBe("norris");
    expect(normalizeDriverId("leclerc")).toBe("leclerc");
    expect(normalizeDriverId("piastri")).toBe("piastri");
    expect(normalizeDriverId("UNKNOWN_ID", "VER", "Verstappen")).toBe("verstappen");
    expect(normalizeDriverId("UNKNOWN_ID", "HAM", "Hamilton")).toBe("hamilton");
  });

  it("normalizes external constructor IDs to Faczz team identifiers", () => {
    expect(normalizeConstructorId("red_bull")).toBe("redbull");
    expect(normalizeConstructorId("mclaren")).toBe("mclaren");
    expect(normalizeConstructorId("ferrari")).toBe("ferrari");
    expect(normalizeConstructorId("aston_martin")).toBe("aston");
    expect(normalizeConstructorId("kick_sauber")).toBe("audi");
    expect(normalizeConstructorId("racing_bulls")).toBe("rb");
  });
});

describe("Phase 5: In-Memory SWR Cache & Request Deduplication", () => {
  let cache: F1DataCache;

  beforeEach(() => {
    cache = new F1DataCache();
  });

  it("caches fresh responses and serves from cache on subsequent calls", async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return {
        data: [{ id: "norris", pts: 374 }],
        provider: "Jolpica",
        providerUrl: "https://api.jolpica.com",
      };
    };

    // First call (cache miss)
    const res1 = await cache.getOrFetch("test-key", 1000, 5000, fetcher);
    expect(res1.meta.freshness).toBe("live");
    expect(callCount).toBe(1);

    // Second call within TTL (cache hit)
    const res2 = await cache.getOrFetch("test-key", 1000, 5000, fetcher);
    expect(res2.meta.freshness).toBe("cached");
    expect(callCount).toBe(1); // Fetcher was not called again!

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  it("coalesces concurrent requests for the same key (deduplication)", async () => {
    let fetchCount = 0;
    const slowFetcher = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return {
        data: { round: 24 },
        provider: "OpenF1",
        providerUrl: "https://openf1.org",
      };
    };

    // Fire 5 concurrent requests simultaneously
    const results = await Promise.all([
      cache.getOrFetch("dedup-key", 1000, 5000, slowFetcher),
      cache.getOrFetch("dedup-key", 1000, 5000, slowFetcher),
      cache.getOrFetch("dedup-key", 1000, 5000, slowFetcher),
      cache.getOrFetch("dedup-key", 1000, 5000, slowFetcher),
      cache.getOrFetch("dedup-key", 1000, 5000, slowFetcher),
    ]);

    expect(results).toHaveLength(5);
    expect(fetchCount).toBe(1); // Only 1 network request fired
  });

  it("serves stale data if upstream fails within stale tolerance window", async () => {
    let shouldFail = false;
    const flakyFetcher = async () => {
      if (shouldFail) {
        throw new Error("503 Upstream Service Unavailable");
      }
      return {
        data: "cached-telemetry-value",
        provider: "Jolpica",
        providerUrl: "https://api.jolpica.com",
      };
    };

    // 1. Initial success (TTL 10ms, maxStale 5000ms)
    const res1 = await cache.getOrFetch("stale-key", 10, 5000, flakyFetcher);
    expect(res1.data).toBe("cached-telemetry-value");

    // Wait 25ms for TTL to expire
    await new Promise((r) => setTimeout(r, 25));

    // 2. Upstream goes down!
    shouldFail = true;

    // Fetch should gracefully return stale data rather than throwing!
    const res2 = await cache.getOrFetch("stale-key", 10, 5000, flakyFetcher);
    expect(res2.data).toBe("cached-telemetry-value");
    expect(res2.meta.freshness).toBe("stale");
  });
});

describe("Phase 5: F1Service Telemetry Engine & Outage Resilience", () => {
  it("retrieves driver standings with valid ranking, points, and meta envelope", async () => {
    const res = await F1Service.getDriverStandings("current");
    expect(res.data.length).toBeGreaterThanOrEqual(20);
    expect(res.data[0]?.pos).toBe(1);
    expect(typeof res.data[0]?.points).toBe("number");
    expect(res.meta.provider).toBeDefined();
    expect(res.meta.freshness).toMatch(/live|cached|stale|fallback/);
  });

  it("retrieves constructor standings with valid teams and points", async () => {
    const res = await F1Service.getConstructorStandings("current");
    expect(res.data.length).toBeGreaterThanOrEqual(10);
    expect(res.data[0]?.pos).toBe(1);
    expect(typeof res.data[0]?.points).toBe("number");
    expect(res.meta.provider).toBeDefined();
  });

  it("retrieves live timing data and track weather without errors", async () => {
    const timing = await F1Service.getLiveTiming();
    expect(timing.data.length).toBeGreaterThan(0);
    expect(timing.data[0]?.pos).toBe(1);
    expect(timing.data[0]?.gapSeconds).toBeDefined();

    const weather = await F1Service.getTrackWeather();
    expect(weather.data.trackTemp).toBeGreaterThan(0);
    expect(weather.data.airTemp).toBeGreaterThan(0);
    expect(weather.data.trackStatus).toBe("AllClear");
  });

  it("returns system health status and cache metrics", () => {
    const health = F1Service.getHealth();
    expect(health.status).toBe("operational");
    expect(health.cache).toBeDefined();
    expect(health.providers.jolpica.status).toBe("connected");
    expect(health.providers.openf1.status).toBe("connected");
  });
});

describe("Phase 5: Backend API Endpoints (/api/f1/*)", () => {
  it("GET /api/f1/standings?type=drivers returns valid JSON with caching headers", async () => {
    const req = new Request("http://localhost:3000/api/f1/standings?type=drivers");
    const res = await h(StandingsRoute).GET!({ request: req });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Cache-Control")).toContain("public");
    expect(res.headers.get("X-Data-Freshness")).toBeDefined();

    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.meta).toBeDefined();
  });

  it("GET /api/f1/standings?type=constructors returns valid constructor standings", async () => {
    const req = new Request("http://localhost:3000/api/f1/standings?type=constructors");
    const res = await h(StandingsRoute).GET!({ request: req });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data[0]?.teamName).toBeDefined();
  });

  it("GET /api/f1/live returns timing tower and weather", async () => {
    const req = new Request("http://localhost:3000/api/f1/live");
    const res = await h(LiveRoute).GET!({ request: req });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("max-age=10");

    const json = await res.json();
    expect(Array.isArray(json.timing)).toBe(true);
    expect(json.weather).toBeDefined();
    expect(json.meta).toBeDefined();
  });

  it("GET /api/f1/health returns provider and cache health", async () => {
    const req = new Request("http://localhost:3000/api/f1/health");
    const res = await h(HealthRoute).GET!({ request: req });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("operational");
    expect(json.cache.entries).toBeGreaterThanOrEqual(0);
  });
});
