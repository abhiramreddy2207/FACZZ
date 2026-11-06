import { describe, expect, it } from "vitest";
import { validatePasswordStrength, hashPassword, verifyPassword } from "@/server/auth/passwords";
import { parseCookie, getSessionTokenFromRequest, serializeSessionCookie } from "@/server/auth/session";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/server/auth/rate-limit";
import { PaddockService } from "@/server/db/service";
import { Route as RegisterRoute } from "@/routes/api/auth/register";
import { Route as LoginRoute } from "@/routes/api/auth/login";
import { Route as LogoutRoute } from "@/routes/api/auth/logout";
import { Route as MeRoute } from "@/routes/api/auth/me";
import { Route as RecoveryRoute } from "@/routes/api/auth/password-recovery";
import { Route as ResetRoute } from "@/routes/api/auth/password-reset";
import { Route as ChangePasswordRoute } from "@/routes/api/auth/password-change";
import { Route as PostDetailRoute } from "@/routes/api/posts/$id";

describe("Production Authentication System (Phase 3)", () => {
  // 1. PASSWORD CRYPTOGRAPHY & STRENGTH
  describe("Password Cryptography & Validation", () => {
    it("enforces strong password policy (length, uppercase, lowercase, number, symbol)", () => {
      const weakShort = validatePasswordStrength("Ab1!");
      expect(weakShort.valid).toBe(false);
      expect(weakShort.errors).toContain("Password must be at least 8 characters long");

      const noUpper = validatePasswordStrength("paddock123!");
      expect(noUpper.valid).toBe(false);
      expect(noUpper.errors).toContain("Password must contain at least one uppercase letter");

      const noSymbol = validatePasswordStrength("Paddock2026");
      expect(noSymbol.valid).toBe(false);
      expect(noSymbol.errors).toContain("Password must contain at least one special symbol");

      const strong = validatePasswordStrength("ScuderiaFerrari#2026!");
      expect(strong.valid).toBe(true);
      expect(strong.errors.length).toBe(0);
    });

    it("hashes and verifies passwords securely using bcrypt salt rounds", async () => {
      const pass = "MonzaGranPremio#16!";
      const hash = await hashPassword(pass);

      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt hash format
      const valid = await verifyPassword(pass, hash);
      expect(valid).toBe(true);

      const invalid = await verifyPassword("WrongPassword123!", hash);
      expect(invalid).toBe(false);
    });
  });

  // 2. REGISTRATION FLOW
  describe("Registration API (/api/auth/register)", () => {
    it("registers new paddock user and returns HttpOnly session cookie", async () => {
      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Carlos Sainz Fan",
          handle: "@smooth_operator_55",
          email: "carlos.fan@paddock.f1",
          password: "WilliamsRacing#55!",
          favTeam: "williams",
          favDriver: "sainz",
        }),
      });

      const res = await RegisterRoute.options.server!.handlers!.POST!({ request: req } as any);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.user.name).toBe("Carlos Sainz Fan");
      expect(data.data.user.handle).toBe("@smooth_operator_55");

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain("faczz_session=");
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain("SameSite=Lax");
    });

    it("rejects duplicate email registrations with 409 conflict", async () => {
      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Another Carlos Fan",
          handle: "@carlos_clone_99",
          email: "carlos.fan@paddock.f1", // duplicate
          password: "WilliamsRacing#55!",
        }),
      });

      const res = await RegisterRoute.options.server!.handlers!.POST!({ request: req } as any);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error.code).toBe("EMAIL_IN_USE");
    });

    it("rejects duplicate handle registrations with 409 conflict", async () => {
      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Operator Clone",
          handle: "@smooth_operator_55", // duplicate handle
          email: "unique.email@paddock.f1",
          password: "WilliamsRacing#55!",
        }),
      });

      const res = await RegisterRoute.options.server!.handlers!.POST!({ request: req } as any);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error.code).toBe("HANDLE_IN_USE");
    });

    it("rejects registration with weak password", async () => {
      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Weak Pass User",
          handle: "@weak_pass_fan",
          email: "weakpass@paddock.f1",
          password: "123",
        }),
      });

      const res = await RegisterRoute.options.server!.handlers!.POST!({ request: req } as any);
      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // 3. LOGIN & ANTI-ENUMERATION
  describe("Login API (/api/auth/login)", () => {
    it("successfully logs in with valid credentials and issues persistent cookie", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "carlos.fan@paddock.f1",
          password: "WilliamsRacing#55!",
        }),
      });

      const res = await LoginRoute.options.server!.handlers!.POST!({ request: req } as any);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe("carlos.fan@paddock.f1");

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain("faczz_session=");
    });

    it("returns generic 401 error on invalid password (prevents account enumeration)", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "carlos.fan@paddock.f1",
          password: "IncorrectPassword#999!",
        }),
      });

      const res = await LoginRoute.options.server!.handlers!.POST!({ request: req } as any);
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error.message).toBe("Invalid email or password");
      expect(data.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("returns identical generic 401 error on non-existent email (prevents enumeration)", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ghost.nonexistent@paddock.f1",
          password: "AnyPassword123!",
        }),
      });

      const res = await LoginRoute.options.server!.handlers!.POST!({ request: req } as any);
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error.message).toBe("Invalid email or password");
      expect(data.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("enforces rate-limiting after repeated failed attempts", () => {
      const testKey = "rate-limit-test-ip:test@paddock.f1";
      resetRateLimit(testKey);

      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testKey, { maxAttempts: 5, windowSeconds: 60, blockDurationSeconds: 60 });
      }

      const blocked = checkRateLimit(testKey, { maxAttempts: 5, windowSeconds: 60, blockDurationSeconds: 60 });
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

      resetRateLimit(testKey);
    });
  });

  // 4. SESSION VERIFICATION & PROFILE MANAGEMENT
  describe("Session & Profile API (/api/auth/me)", () => {
    it("returns authenticated user profile when valid session cookie is provided", async () => {
      // 1. Log in to get token
      const loginReq = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "carlos.fan@paddock.f1",
          password: "WilliamsRacing#55!",
        }),
      });
      const loginRes = await LoginRoute.options.server!.handlers!.POST!({ request: loginReq } as any);
      const setCookie = loginRes.headers.get("set-cookie")!;
      const token = parseCookie(setCookie, "faczz_session")!;
      expect(token).toBeDefined();

      // 2. Fetch /api/auth/me
      const meReq = new Request("http://localhost:3000/api/auth/me", {
        headers: { Cookie: `faczz_session=${token}` },
      });
      const meRes = await MeRoute.options.server!.handlers!.GET!({ request: meReq } as any);
      expect(meRes.status).toBe(200);

      const data = await meRes.json();
      expect(data.data.email).toBe("carlos.fan@paddock.f1");
      expect(data.data.name).toBe("Carlos Sainz Fan");
    });

    it("rejects unauthorized access when session cookie is missing", async () => {
      const meReq = new Request("http://localhost:3000/api/auth/me");
      const meRes = await MeRoute.options.server!.handlers!.GET!({ request: meReq } as any);
      expect(meRes.status).toBe(401);
    });

    it("updates authenticated user profile via PATCH", async () => {
      const user = await PaddockService.findUserByEmail("carlos.fan@paddock.f1");
      expect(user).not.toBeNull();

      const token = "mock-test-token-profile-patch";
      await PaddockService.createSession(user!.id, token, new Date(Date.now() + 60000));

      const patchReq = new Request("http://localhost:3000/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `faczz_session=${token}`,
        },
        body: JSON.stringify({
          bio: "Williams Racing strategist and tyre analyst.",
          location: "Grove, Oxfordshire",
        }),
      });

      const patchRes = await MeRoute.options.server!.handlers!.PATCH!({ request: patchReq } as any);
      expect(patchRes.status).toBe(200);

      const data = await patchRes.json();
      expect(data.data.bio).toBe("Williams Racing strategist and tyre analyst.");
      expect(data.data.location).toBe("Grove, Oxfordshire");
    });
  });

  // 5. LOGOUT & SESSION INVALIDATION
  describe("Logout API (/api/auth/logout)", () => {
    it("invalidates session and clears HttpOnly cookie", async () => {
      const user = await PaddockService.findUserByEmail("carlos.fan@paddock.f1");
      const token = "logout-session-token-test";
      await PaddockService.createSession(user!.id, token, new Date(Date.now() + 60000));

      const logoutReq = new Request("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: { Cookie: `faczz_session=${token}` },
      });

      const logoutRes = await LogoutRoute.options.server!.handlers!.POST!({ request: logoutReq } as any);
      expect(logoutRes.status).toBe(200);

      const setCookie = logoutRes.headers.get("set-cookie")!;
      expect(setCookie).toContain("Max-Age=0");

      // Verify token is invalidated in DB/store
      const validated = await PaddockService.findSessionByToken(token);
      expect(validated).toBeNull();
    });
  });

  // 6. PASSWORD RECOVERY & CHANGE
  describe("Password Recovery & Reset Flows", () => {
    it("generates single-use reset token and resets password", async () => {
      // 1. Request recovery
      const recReq = new Request("http://localhost:3000/api/auth/password-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "carlos.fan@paddock.f1" }),
      });

      const recRes = await RecoveryRoute.options.server!.handlers!.POST!({ request: recReq } as any);
      expect(recRes.status).toBe(200);
      const recData = await recRes.json();
      expect(recData.success).toBe(true);
      const resetToken = recData.meta?.resetToken;
      expect(resetToken).toBeDefined();

      // 2. Reset password using token
      const newPassword = "BrandNewPassword#2026!";
      const resetReq = new Request("http://localhost:3000/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          password: newPassword,
        }),
      });

      const resetRes = await ResetRoute.options.server!.handlers!.POST!({ request: resetReq } as any);
      expect(resetRes.status).toBe(200);

      // 3. Verify new password logs in
      const loginReq = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "carlos.fan@paddock.f1",
          password: newPassword,
        }),
      });
      const loginRes = await LoginRoute.options.server!.handlers!.POST!({ request: loginReq } as any);
      expect(loginRes.status).toBe(200);

      // 4. Verify token cannot be reused
      const reuseReq = new Request("http://localhost:3000/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          password: "AnotherPassword#2026!",
        }),
      });
      const reuseRes = await ResetRoute.options.server!.handlers!.POST!({ request: reuseReq } as any);
      expect(reuseRes.status).toBe(400);
    });

    it("allows authenticated user to change password and rotates session", async () => {
      const user = await PaddockService.findUserByEmail("carlos.fan@paddock.f1");
      const currentToken = "session-before-password-change";
      await PaddockService.createSession(user!.id, currentToken, new Date(Date.now() + 60000));

      const changeReq = new Request("http://localhost:3000/api/auth/password-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `faczz_session=${currentToken}`,
        },
        body: JSON.stringify({
          currentPassword: "BrandNewPassword#2026!",
          newPassword: "UpdatedPaddockSecret#99!",
        }),
      });

      const changeRes = await ChangePasswordRoute.options.server!.handlers!.POST!({ request: changeReq } as any);
      expect(changeRes.status).toBe(200);

      const setCookie = changeRes.headers.get("set-cookie");
      expect(setCookie).toBeDefined();

      // Old session was invalidated
      const oldSession = await PaddockService.findSessionByToken(currentToken);
      expect(oldSession).toBeNull();
    });
  });

  // 7. AUTHORIZATION GUARDS (BOLA PREVENTION)
  describe("API Authorization & BOLA Prevention", () => {
    it("prevents unauthorized user from deleting another user's post", async () => {
      // 1. Create post by user A
      const post = await PaddockService.createPost({
        authorId: "user-author-a",
        category: "Hot Take",
        content: "Undercut will decide the winner in Bahrain.",
        tags: ["Bahrain"],
        teams: ["ferrari"],
        drivers: ["leclerc"],
      });
      expect(post).toBeDefined();

      // 2. Attacker B tries to delete post
      const deleteReq = new Request(`http://localhost:3000/api/posts/${post!.id}?userId=attacker-b`, {
        method: "DELETE",
      });

      const deleteRes = await PostDetailRoute.options.server!.handlers!.DELETE!({
        request: deleteReq,
        params: { id: post!.id },
      } as any);

      expect(deleteRes.status).toBe(403);
      const data = await deleteRes.json();
      expect(data.error.code).toBe("FORBIDDEN");

      // 3. Genuine author can delete
      const authorDeleteReq = new Request(`http://localhost:3000/api/posts/${post!.id}?userId=user-author-a`, {
        method: "DELETE",
      });

      const authorRes = await PostDetailRoute.options.server!.handlers!.DELETE!({
        request: authorDeleteReq,
        params: { id: post!.id },
      } as any);

      expect(authorRes.status).toBe(200);
      const authorData = await authorRes.json();
      expect(authorData.data.deleted).toBe(true);
    });
  });
});
