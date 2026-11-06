import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "faczz_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Generate a cryptographically secure random token (64 hex characters)
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Serialize a session cookie with production-grade security attributes:
 * - HttpOnly (prevents XSS access)
 * - SameSite=Lax (mitigates CSRF)
 * - Secure (enforced in production HTTPS)
 * - Path=/ (universal paddock scope)
 */
export function serializeSessionCookie(token: string, maxAge = SESSION_MAX_AGE_SECONDS): string {
  const isProd = process.env["NODE_ENV"] === "production";
  const secureFlag = isProd ? "; Secure" : "";
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Expires=${expires}${secureFlag}`;
}

/**
 * Serialize cookie deletion header
 */
export function serializeClearSessionCookie(): string {
  const isProd = process.env["NODE_ENV"] === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
}

/**
 * Parse a specific cookie value from a standard Request headers Cookie string
 */
export function parseCookie(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, ...rawVal] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawVal.join("="));
    }
  }
  return null;
}

/**
 * Extract session token from standard Request
 */
export function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  const token = parseCookie(cookieHeader, SESSION_COOKIE_NAME);
  if (token) return token;

  // Fallback support for Authorization Bearer in programmatic API clients
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}
