import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const PLANNER_SESSION_COOKIE = "yourailens_planner";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 days

type SessionPayload = {
  mid: string;
  exp: number;
};

function getSessionKey(): Buffer | null {
  const explicit = process.env.PLANNER_SESSION_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) {
    return createHash("sha256").update(`yourailens.planner.session.v1:${explicit}`, "utf8").digest();
  }
  const pw = process.env.ADMIN_PASSWORD?.trim();
  if (!pw) return null;
  return createHash("sha256").update(`yourailens.planner.session.v1:${pw}`, "utf8").digest();
}

export function createPlannerSessionToken(memberId: string): string | null {
  const key = getSessionKey();
  if (!key || !memberId) return null;
  const payload: SessionPayload = {
    mid: memberId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", key).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyPlannerSessionToken(
  token: string | undefined | null
): { ok: true; memberId: string } | { ok: false } {
  if (!token) return { ok: false };
  const key = getSessionKey();
  if (!key) return { ok: false };
  const dot = token.indexOf(".");
  if (dot <= 0) return { ok: false };
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payloadB64 || !sig) return { ok: false };
  const expectedSig = createHmac("sha256", key).update(payloadB64).digest("base64url");
  let sigBuf: Buffer;
  let expBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, "base64url");
    expBuf = Buffer.from(expectedSig, "base64url");
  } catch {
    return { ok: false };
  }
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return { ok: false };
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.mid !== "string" || typeof payload.exp !== "number") return { ok: false };
    if (payload.exp <= Math.floor(Date.now() / 1000)) return { ok: false };
    return { ok: true, memberId: payload.mid };
  } catch {
    return { ok: false };
  }
}

export function plannerSessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/" as const,
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
