/**
 * Backfill poster_url for YAIL Vault videos missing a thumbnail.
 *
 * Usage (from repo root, with .env.local):
 *   node scripts/backfill-yail-vault-posters.mjs
 *
 * Requires: ffmpeg, AWS + Supabase env vars.
 */
import { createClient } from "@supabase/supabase-js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function findFfmpeg() {
  for (const bin of ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "ffmpeg"]) {
    const r = spawnSync(bin, ["-version"], { encoding: "utf8" });
    if (r.status === 0) return bin;
  }
  return null;
}

function publicObjectUrl(bucket, region, key) {
  const encodedKey = key.split("/").map((p) => encodeURIComponent(p)).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const region = (process.env.AWS_S3_REGION || process.env.AWS_REGION || "").trim();
const bucket = (process.env.AWS_S3_BUCKET || "").trim();
const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || "").trim();
const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();
const sessionToken = (process.env.AWS_SESSION_TOKEN || "").trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!region || !bucket || !accessKeyId || !secretAccessKey) {
  console.error("Missing AWS S3 env (AWS_S3_REGION/AWS_REGION, AWS_S3_BUCKET, keys)");
  process.exit(1);
}

const ffmpeg = findFfmpeg();
if (!ffmpeg) {
  console.error("ffmpeg not found");
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey);
const s3 = new S3Client({
  region,
  followRegionRedirects: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
    ...(sessionToken ? { sessionToken } : {}),
  },
});

const tmpRoot = join(tmpdir(), "yail-vault-posters");
mkdirSync(tmpRoot, { recursive: true });

const { data, error } = await db
  .from("yail_vault_entries")
  .select("id,slug,title,media_type,media_url,poster_url")
  .eq("media_type", "video")
  .or("poster_url.is.null,poster_url.eq.");

if (error) {
  console.error(error);
  process.exit(1);
}

const rows = (data || []).filter((r) => r.media_url && !String(r.poster_url || "").trim());
console.log(`videos missing poster: ${rows.length}`);

let ok = 0;
let fail = 0;

for (const row of rows) {
  const out = join(tmpRoot, `${row.id}.jpg`);
  console.log("extract", row.slug || row.id, row.title);

  let r = spawnSync(
    ffmpeg,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      "0.8",
      "-i",
      row.media_url,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      out,
    ],
    { encoding: "utf8" }
  );
  if (r.status !== 0 || !existsSync(out)) {
    r = spawnSync(
      ffmpeg,
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        row.media_url,
        "-ss",
        "0.2",
        "-frames:v",
        "1",
        "-q:v",
        "3",
        out,
      ],
      { encoding: "utf8" }
    );
  }

  if (r.status !== 0 || !existsSync(out)) {
    console.log("  FAIL ffmpeg", (r.stderr || "").slice(0, 220));
    fail += 1;
    continue;
  }

  const bytes = readFileSync(out);
  const key = `yail-vault/posters/backfill-${row.id}-${Date.now()}.jpg`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: "image/jpeg",
      })
    );
    const poster_url = publicObjectUrl(bucket, region, key);
    const { error: upErr } = await db
      .from("yail_vault_entries")
      .update({ poster_url, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (upErr) {
      console.log("  FAIL db", upErr.message);
      fail += 1;
    } else {
      console.log("  ok", poster_url);
      ok += 1;
    }
  } catch (e) {
    console.log("  FAIL s3", e instanceof Error ? e.message : e);
    fail += 1;
  } finally {
    try {
      unlinkSync(out);
    } catch {
      /* ignore */
    }
  }
}

console.log(`done. ok=${ok} fail=${fail}`);
