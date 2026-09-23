// Admin session tokens. Uses Web Crypto so it works in the proxy and in server code.
//
// Cookie value: "<userId>.<sessionVersion>.<expiresMs>.<HMAC>". userId is "owner" for the
// env-configured default super admin, or the admin_users.id for everyone else.
// The proxy only checks the signature and expiry; server code (admin-session.ts) also checks
// the user still exists and the session version matches, so deletions take effect at once.

export const SESSION_COOKIE = "nh_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours, in seconds
export const OWNER_ID = "owner";

export type SessionClaims = { uid: string; ver: number; exp: number };

const encoder = new TextEncoder();

export function ownerUsername() {
  return (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
}

async function signingKey() {
  // AUTH_SECRET is optional; without it the key is derived from the owner's credentials,
  // which means changing ADMIN_PASSWORD signs every admin out.
  const secret =
    process.env.AUTH_SECRET ||
    (process.env.ADMIN_PASSWORD ? `${ownerUsername()}:${process.env.ADMIN_PASSWORD}` : null);
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(`${secret}:nh-admin-session`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function hmac(key: CryptoKey, data: string) {
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

/** Compares two strings in constant time (for equal lengths) to avoid timing leaks. */
export function safeEqual(a: string, b: string) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function canSignSessions() {
  return (await signingKey()) !== null;
}

export async function createSessionToken(uid: string, ver: number) {
  const key = await signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD (or AUTH_SECRET) is not set");
  const payload = `${uid}.${ver}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await hmac(key, payload)}`;
}

export async function readSessionToken(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [uid, ver, exp, sig] = parts;
  if (!(Number(exp) > Date.now()) || !Number.isInteger(Number(ver))) return null;
  const key = await signingKey();
  if (!key || !safeEqual(sig, await hmac(key, `${uid}.${ver}.${exp}`))) return null;
  return { uid, ver: Number(ver), exp: Number(exp) };
}
