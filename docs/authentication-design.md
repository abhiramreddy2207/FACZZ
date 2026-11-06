# Faczz Paddock — Authentication & Security Architecture

**Phase 3 Implementation Reference**  
**Author:** Senior Authentication & Application Security Engineer  
**Status:** Implemented & Verified in Production Baseline  

---

## 1. Architecture Overview

Faczz Paddock replaces simulated authentication with a production-grade, hardened authentication tier engineered directly into the Nitro / TanStack Start server stack backed by PostgreSQL (via Neon / Drizzle ORM) with local memory fallbacks.

```
                          ┌───────────────────────────┐
                          │   Client Application      │
                          │   (React + TanStack)      │
                          └─────────────┬─────────────┘
                                        │ Credentials / OAuth Redirect
                                        ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                       Nitro API Auth Tier                              │
   │                                                                        │
   │  ┌───────────────────────┐  ┌──────────────────────┐  ┌─────────────┐  │
   │  │ POST /api/auth/login  │  │ POST /register       │  │ GET /google │  │
   │  │ (Rate Limited, 401    │  │ (Strength Validation,│  │ (PKCE State │  │
   │  │  Generic Anti-Enum)   │  │  Bcrypt Salt Rounds) │  │  CSRF Guard)│  │
   │  └───────────┬───────────┘  └──────────┬───────────┘  └──────┬──────┘  │
   │              │                         │                     │         │
   │              └────────────────┬────────┴─────────────────────┘         │
   │                               │                                        │
   │                               ▼                                        │
   │                 ┌───────────────────────────┐                          │
   │                 │     Session Manager       │                          │
   │                 │  - Crypto random tokens   │                          │
   │                 │  - HttpOnly; SameSite=Lax │                          │
   │                 │  - Secure (in production) │                          │
   │                 │  - Automatic Rotation     │                          │
   │                 └─────────────┬─────────────┘                          │
   └───────────────────────────────┼────────────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                    Database Layer (Drizzle ORM)                        │
   │                                                                        │
   │  [users] ◄────────────── [accounts] (provider, provider_account_id,    │
   │    │                                password_hash)                     │
   │    ├── [sessions] (token, expires_at)                                  │
   │    └── [verification_tokens] (token, type, identifier, expires_at)    │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Methods & Security Specifications

### 2.1 Google OAuth 2.0 Integration
- **Endpoints:**
  - `GET /api/auth/google`: Generates a high-entropy cryptographically secure random state (24-byte hex token) and stores it in a short-lived `faczz_oauth_state` cookie (`HttpOnly`, `SameSite=Lax`, `Max-Age=600`). Redirects to Google's consent screen requesting `openid email profile`.
  - `GET /api/auth/google-callback`: Verifies the inbound state against the cookie to prevent Cross-Site Request Forgery (CSRF). Exchanges the authorization code against `https://oauth2.googleapis.com/token` and fetches verified profile from `https://www.googleapis.com/oauth2/v3/userinfo`.
- **Safe Account Linking:**
  - If a user with the matching email already exists, Google OAuth credentials link safely to the existing account without overwriting existing data.
  - If no account exists, a new user profile is created with verified badge and randomized paddock handle.

### 2.2 Email and Password Credentials
- **Password Strength Policy:**
  - Minimum length: 8 characters.
  - At least 1 uppercase letter (`A-Z`).
  - At least 1 lowercase letter (`a-z`).
  - At least 1 numerical digit (`0-9`).
  - At least 1 special character (`[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]`).
- **Server-Side Password Hashing:**
  - Implemented using `bcryptjs` with salt rounds = 12, ensuring memory hardness and CPU cost against rainbow table and ASIC cracking.
- **Account Enumeration Defense:**
  - Both `/api/auth/login` and `/api/auth/password-recovery` employ generic responses.
  - Failed login attempts for non-existent emails return identical `401 INVALID_CREDENTIALS` responses and timings as incorrect passwords.
  - Password recovery returns a generic success response regardless of whether the email exists.
- **Brute Force Protection (Rate Limiting):**
  - IP and account-scoped sliding window rate limiter.
  - Locks out authentication attempts after 5 consecutive failures for a 15-minute window (`429 TOO_MANY_ATTEMPTS` with standard `Retry-After` header).

### 2.3 Persistent Sessions & Cookie Architecture
- **Cookie Attributes:**
  - `faczz_session=<64-byte-crypto-hex>`
  - `HttpOnly`: Strictly prevents script and XSS extraction.
  - `SameSite=Lax`: Defends against Cross-Site Request Forgery during external navigation.
  - `Path=/`: Universal paddock scope.
  - `Secure`: Enforced in production environments.
  - `Max-Age=2592000` (30 days persistent sliding validity).
- **Session Rotation & Revocation:**
  - Logout (`POST /api/auth/logout`) deletes the session record from the database and delivers a header with `Max-Age=0` and expired date (`Thu, 01 Jan 1970 00:00:00 GMT`).
  - Password changes (`POST /api/auth/password-change`) invalidate all prior user sessions immediately, creating a single fresh rotated session for the active device.

### 2.4 Server-Side Authorization (BOLA Defense)
- Client-side route blocking is supplemented by server-side verification on all mutation operations:
  - `DELETE /api/posts/:id`: Confirms the requesting user matches `post.authorId`. Attempts by other users return `403 FORBIDDEN`.
  - `DELETE /api/posts/:id/comments`: Confirms the requesting user matches `comment.authorId`.
  - `PATCH /api/users/:id`: Confirms the active session matches `params.id`.
  - `POST /api/posts/:id/vote`: Enforces unique constraint preventing duplicate voting per user per poll.

---

## 3. API Endpoint Catalog

| Endpoint | Method | Auth Required | Description | Status Codes |
|---|---|---|---|---|
| `/api/auth/register` | POST | No | Create new user account with credentials & session cookie | `201`, `409`, `422`, `500` |
| `/api/auth/login` | POST | No | Verify credentials, rate-limit check, issue session cookie | `200`, `401`, `422`, `429` |
| `/api/auth/logout` | POST | Optional | Invalidate session in DB and clear cookie | `200` |
| `/api/auth/me` | GET | Yes | Read HTTP-only cookie and return active authenticated user | `200`, `401` |
| `/api/auth/me` | PATCH | Yes | Update authenticated user profile | `200`, `401`, `409`, `422` |
| `/api/auth/password-recovery` | POST | No | Request single-use password reset token (anti-enumeration) | `200`, `422` |
| `/api/auth/password-reset` | POST | No | Reset password using single-use verification token | `200`, `400`, `422` |
| `/api/auth/password-change` | POST | Yes | Update password for authenticated user and rotate sessions | `200`, `401`, `403`, `422` |
| `/api/auth/google` | GET | No | Initiate Google OAuth 2.0 PKCE flow | `302`, `200`, `503` |
| `/api/auth/google-callback` | GET | No | Validate state, exchange code, link account, set session | `302`, `200`, `400`, `403` |

---

## 4. Verification & Automated Test Suite

Automated verification tests are maintained in `src/test/auth.test.ts` alongside existing unit and integration test suites:
- **17/17 Phase 3 Authentication Tests Passing**
- **67/67 Overall Project Tests Passing**
- **Zero TypeScript Compiler Diagnostics** (`npx tsc --noEmit`)
- **Clean Production Build** (`npm run build`) for client and SSR server.
