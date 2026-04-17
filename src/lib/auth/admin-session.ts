import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** HttpOnly cookie set after successful POST /api/admin/login */
export const ADMIN_SESSION_COOKIE = "yourailens_admin";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSessionKey(): Buffer | null {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) {
    return createHash("sha256").update(explicit, "utf8").digest();
  }
  const pw = process.env.ADMIN_PASSWORD?.trim();
  if (!pw) return null;
  return createHash("sha256").update(`yourailens.admin.session.v1:${pw}`, "utf8").digest();
}

export function getAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

/**
 * Constant-time compare for login. ADMIN_PASSWORD is read from env only.
 */
export function adminPasswordMatches(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected?.length || !provided.length) return false;
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminSessionToken(): string | null {
  const key = getSessionKey();
  if (!key) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payloadB64 = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", key).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const key = getSessionKey();
  if (!key) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payloadB64 || !sig) return false;
  const expectedSig = createHmac("sha256", key).update(payloadB64).digest("base64url");
  let sigBuf: Buffer;
  let expBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, "base64url");
    expBuf = Buffer.from(expectedSig, "base64url");
  } catch {
    return false;
  }
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/" as const,
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
