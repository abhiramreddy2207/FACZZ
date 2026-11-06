import { loginUser, logoutUser, updateUserProfile, type UserAccount } from "./store";

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  badge?: string;
  location?: string;
  favTeam?: string;
  favDriver?: string;
  followersCount?: number;
  followingCount?: number;
}

function mapApiUserToAccount(u: AuthUserResponse): UserAccount {
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    email: u.email,
    avatar: u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: u.bio || "F1 enthusiast, data scout, and paddock member.",
    favTeam: u.favTeam || "ferrari",
    favDriver: u.favDriver || "leclerc",
    location: u.location || "Global Paddock",
    joinedDate: "Recently",
    followersCount: u.followersCount ?? 0,
    followingCount: u.followingCount ?? 0,
    badge: u.badge || "Paddock Member",
  };
}

/**
 * Check active server session on app initialization
 */
export async function syncSessionUser(): Promise<UserAccount | null> {
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && data.data) {
      const account = mapApiUserToAccount(data.data);
      loginUser(account);
      return account;
    }
  } catch {
    // Network or serverless init error - continue with client store
  }
  return null;
}

/**
 * Real API Login with email and password
 */
export async function apiLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || "Invalid email or password",
      };
    }

    const account = mapApiUserToAccount(json.data.user);
    loginUser(account);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Connection failed. Please check your network.",
    };
  }
}

/**
 * Real API Registration with password strength validation
 */
export async function apiRegister(payload: {
  name: string;
  handle: string;
  email: string;
  password: string;
  favTeam?: string;
  favDriver?: string;
}): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || "Registration failed",
        details: json.error?.details,
      };
    }

    const account = mapApiUserToAccount(json.data.user);
    loginUser(account);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Network error. Please try again.",
    };
  }
}

/**
 * Real API Logout (invalidates DB session and clears HttpOnly cookie)
 */
export async function apiLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore error
  } finally {
    logoutUser();
  }
}

/**
 * Password Recovery Request
 */
export async function apiRecoverPassword(email: string): Promise<{ success: boolean; message: string; meta?: any }> {
  try {
    const res = await fetch("/api/auth/password-recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
    });

    const json = await res.json();
    return {
      success: json.success ?? false,
      message: json.message || "Instructions sent if email is registered.",
      meta: json.meta,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error requesting recovery.",
    };
  }
}

/**
 * Password Reset with Token
 */
export async function apiResetPassword(token: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to reset password." };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error." };
  }
}

/**
 * Authenticated Password Change
 */
export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/password-change", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Password update rejected." };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error." };
  }
}

/**
 * Authenticated Profile Update
 */
export async function apiUpdateProfile(patch: Partial<UserAccount>): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: patch.name,
        handle: patch.handle,
        bio: patch.bio,
        avatarUrl: patch.avatar,
        favTeam: patch.favTeam,
        favDriver: patch.favDriver,
        location: patch.location,
      }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      updateUserProfile(patch);
      return { success: true };
    }
  } catch {
    // Local fallback
  }

  updateUserProfile(patch);
  return { success: true };
}
