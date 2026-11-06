import crypto from "node:crypto";

export const GOOGLE_OAUTH_STATE_COOKIE = "faczz_oauth_state";

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name: string;
  picture?: string;
}

export function getGoogleConfig() {
  return {
    clientId: process.env["GOOGLE_CLIENT_ID"] || "",
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"] || "",
    isConfigured: Boolean(process.env["GOOGLE_CLIENT_ID"] && process.env["GOOGLE_CLIENT_SECRET"]),
  };
}

export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function serializeOAuthStateCookie(state: string): string {
  const isProd = process.env["NODE_ENV"] === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${GOOGLE_OAUTH_STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secureFlag}`;
}

export function buildGoogleAuthUrl(origin: string, state: string): string {
  const { clientId } = getGoogleConfig();
  const redirectUri = `${origin}/api/auth/google-callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  origin: string
): Promise<GoogleUserInfo> {
  const { clientId, clientSecret } = getGoogleConfig();
  const redirectUri = `${origin}/api/auth/google-callback`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Google token exchange failed: ${errorText}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_type?: string; access_token: string };

  const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error("Failed to fetch Google user profile");
  }

  return (await userResponse.json()) as GoogleUserInfo;
}
