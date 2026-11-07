import { z } from "zod";

// =========================================================
// DATA FRESHNESS ENUM & METADATA
// =========================================================
export type DataFreshness = "live" | "cached" | "stale" | "fallback";

export type F1Meta = {
  provider: string;
  providerUrl: string;
  freshness: DataFreshness;
  cachedAt: string;
  staleAt: string;
  expiresAt: string;
  latencyMs: number;
  season?: string | undefined;
  round?: (number | string) | undefined;
};

export type F1ApiResponse<T> = {
  data: T;
  meta: F1Meta;
};

// =========================================================
// DRIVER STANDINGS SCHEMA & TYPES
// =========================================================
export const DriverStandingItemSchema = z.object({
  pos: z.number(),
  driverId: z.string(),
  driverName: z.string(),
  code: z.string(),
  number: z.number().optional(),
  teamId: z.string(),
  teamName: z.string(),
  points: z.number(),
  wins: z.number(),
  behindLeader: z.number(),
});

export type DriverStandingItem = z.infer<typeof DriverStandingItemSchema>;

// =========================================================
// CONSTRUCTOR STANDINGS SCHEMA & TYPES
// =========================================================
export const ConstructorStandingItemSchema = z.object({
  pos: z.number(),
  teamId: z.string(),
  teamName: z.string(),
  points: z.number(),
  wins: z.number(),
  behindLeader: z.number(),
  engine: z.string().optional(),
});

export type ConstructorStandingItem = z.infer<typeof ConstructorStandingItemSchema>;

// =========================================================
// LIVE TIMING & WEATHER SCHEMAS & TYPES
// =========================================================
export const LiveTimingRowSchema = z.object({
  pos: z.number(),
  driverId: z.string(),
  code: z.string(),
  driverName: z.string(),
  teamId: z.string(),
  teamName: z.string(),
  gap: z.string(),
  gapSeconds: z.number(),
  interval: z.string(),
  lastLapTime: z.string(),
  inPit: z.boolean(),
  pitStops: z.number(),
  tyreCompound: z.enum(["soft", "medium", "hard", "intermediate", "wet", "unknown"]).optional(),
});

export type LiveTimingRow = z.infer<typeof LiveTimingRowSchema>;

export const TrackWeatherSchema = z.object({
  airTemp: z.number(),
  trackTemp: z.number(),
  humidity: z.number(),
  rainfall: z.boolean(),
  windSpeed: z.number(),
  windDirection: z.number().optional(),
  trackStatus: z.enum(["AllClear", "YellowFlag", "RedFlag", "SafetyCar", "VirtualSafetyCar"]).default("AllClear"),
  recordedAt: z.string(),
});

export type TrackWeather = z.infer<typeof TrackWeatherSchema>;

export const LiveSessionDataSchema = z.object({
  sessionName: z.string(),
  circuitName: z.string(),
  country: z.string(),
  lap: z.number(),
  totalLaps: z.number(),
  status: z.enum(["upcoming", "live", "finished"]),
  weather: TrackWeatherSchema,
  timing: z.array(LiveTimingRowSchema),
});

export type LiveSessionData = z.infer<typeof LiveSessionDataSchema>;

// =========================================================
// UPSTREAM JOLPICA / ERGAST RAW TYPES (FOR VALIDATION)
// =========================================================
export const JolpicaDriverStandingRawSchema = z.object({
  position: z.string(),
  points: z.string(),
  wins: z.string(),
  Driver: z.object({
    driverId: z.string(),
    code: z.string().optional(),
    permanentNumber: z.string().optional(),
    givenName: z.string(),
    familyName: z.string(),
  }),
  Constructors: z.array(
    z.object({
      constructorId: z.string(),
      name: z.string(),
    })
  ).default([]),
});

export const JolpicaConstructorStandingRawSchema = z.object({
  position: z.string(),
  points: z.string(),
  wins: z.string(),
  Constructor: z.object({
    constructorId: z.string(),
    name: z.string(),
  }),
});
