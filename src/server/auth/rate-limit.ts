/**
 * In-memory token-bucket / sliding-window rate limiter for sensitive authentication operations
 * Protects against brute-force password guessing and credential stuffing attacks.
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale rate limit entries every 10 minutes
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.firstAttemptAt > 60 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
  if (timer.unref) {
    timer.unref();
  }
}

export interface RateLimitOptions {
  maxAttempts: number;
  windowSeconds: number;
  blockDurationSeconds: number;
}

const DEFAULT_LOGIN_LIMITS: RateLimitOptions = {
  maxAttempts: 5,
  windowSeconds: 15 * 60, // 15 minutes window
  blockDurationSeconds: 15 * 60, // 15 minutes lock
};

/**
 * Check if an IP or identifier has exceeded allowed authentication attempts
 */
export function checkRateLimit(
  identifier: string,
  options = DEFAULT_LOGIN_LIMITS
): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    return { allowed: true, remaining: options.maxAttempts };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  // Check if window has expired
  if (now - record.firstAttemptAt > options.windowSeconds * 1000) {
    rateLimitStore.delete(identifier);
    return { allowed: true, remaining: options.maxAttempts };
  }

  // Check if within attempts
  if (record.attempts >= options.maxAttempts) {
    record.blockedUntil = now + options.blockDurationSeconds * 1000;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: options.blockDurationSeconds,
    };
  }

  return {
    allowed: true,
    remaining: options.maxAttempts - record.attempts,
  };
}

/**
 * Record a failed attempt
 */
export function recordFailedAttempt(
  identifier: string,
  options = DEFAULT_LOGIN_LIMITS
): void {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttemptAt: now,
    });
    return;
  }

  if (now - record.firstAttemptAt > options.windowSeconds * 1000) {
    record.attempts = 1;
    record.firstAttemptAt = now;
    delete record.blockedUntil;
    return;
  }

  record.attempts += 1;
  if (record.attempts >= options.maxAttempts) {
    record.blockedUntil = now + options.blockDurationSeconds * 1000;
  }
}

/**
 * Reset rate limit on successful authentication
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
