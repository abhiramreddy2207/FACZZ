import type { DataFreshness, F1ApiResponse, F1Meta } from "./types";

interface CacheEntry<T> {
  data: T;
  meta: F1Meta;
  cachedAtMs: number;
  expiresAtMs: number;
  staleAtMs: number;
}

export class F1DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<any>>();
  private hitCount = 0;
  private missCount = 0;
  private staleCount = 0;

  /**
   * Fetch with Stale-While-Revalidate & Request Deduplication
   * @param key Unique cache key
   * @param ttlMs Time-to-live before data is considered stale
   * @param maxStaleMs Time window after ttl during which stale data can still be served if upstream fails
   * @param fetcher Async function to fetch fresh data from upstream provider
   */
  async getOrFetch<T>(
    key: string,
    ttlMs: number,
    maxStaleMs: number,
    fetcher: () => Promise<{ data: T; provider: string; providerUrl: string; season?: string; round?: number | string }>
  ): Promise<F1ApiResponse<T>> {
    const now = Date.now();
    const existing = this.cache.get(key) as CacheEntry<T> | undefined;

    // 1. Fresh Cache Hit
    if (existing && now < existing.expiresAtMs) {
      this.hitCount++;
      return {
        data: existing.data,
        meta: {
          ...existing.meta,
          freshness: "cached",
        },
      };
    }

    // 2. Request Deduplication: if an upstream request for this key is already running, await it
    const running = this.inflight.get(key);
    if (running) {
      try {
        const result = (await running) as F1ApiResponse<T>;
        return result;
      } catch (err) {
        // If the shared request fails, fallback to stale if available
        if (existing && now < existing.staleAtMs) {
          this.staleCount++;
          return {
            data: existing.data,
            meta: {
              ...existing.meta,
              freshness: "stale" as const,
            },
          };
        }
        throw err;
      }
    }

    // 3. Launch single upstream fetch
    const fetchPromise: Promise<F1ApiResponse<T>> = (async () => {
      const startTime = Date.now();
      try {
        const fresh = await fetcher();
        const latencyMs = Date.now() - startTime;
        const cachedAt = new Date().toISOString();
        const expiresAt = new Date(now + ttlMs).toISOString();
        const staleAt = new Date(now + ttlMs + maxStaleMs).toISOString();

        const meta: F1Meta = {
          provider: fresh.provider,
          providerUrl: fresh.providerUrl,
          freshness: "live",
          cachedAt,
          expiresAt,
          staleAt,
          latencyMs,
          season: fresh.season,
          round: fresh.round,
        };

        const entry: CacheEntry<T> = {
          data: fresh.data,
          meta,
          cachedAtMs: now,
          expiresAtMs: now + ttlMs,
          staleAtMs: now + ttlMs + maxStaleMs,
        };

        this.cache.set(key, entry);
        this.missCount++;

        return {
          data: fresh.data,
          meta,
        };
      } catch (upstreamErr) {
        // 4. Stale-While-Revalidate Fallback: Upstream failed, serve stale entry if within maxStaleMs
        if (existing && now < existing.staleAtMs) {
          this.staleCount++;
          return {
            data: existing.data,
            meta: {
              ...existing.meta,
              freshness: "stale" as const,
            },
          };
        }
        throw upstreamErr;
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Invalidate a specific key or all keys
   */
  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Diagnostic metrics
   */
  getStats() {
    return {
      entries: this.cache.size,
      inflight: this.inflight.size,
      hits: this.hitCount,
      misses: this.missCount,
      staleServed: this.staleCount,
    };
  }
}

// Global Singleton cache for F1 data
export const globalF1Cache = new F1DataCache();
