/**
 * One-time stills for community videos uploaded before frame extraction.
 * Usage: node --env-file=.env.local scripts/backfill-community-frames.mjs
 */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const execFileAsync = promisify(execFile);
const STILL_COUNT = 5;

function stillTimes(duration) {
  const safe = Number.isFinite(duration) && duration > 0.4 ? duration : 8;
  const start = Math.min(0.6, safe * 0.06);
  const end = Math.max(start + 0.2, safe - Math.min(0.45, safe * 0.06));
  return Array.from({ length: STILL_COUNT }, (_, index) => {
    const t = start + ((end - start) * index) / (STILL_COUNT - 1);
    return Math.round(t * 100) / 100;
  });
}

function publicObjectUrl(bucket, region, key) {
  const encodedKey = key.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

const region = (process.env.AWS_S3_REGION ?? process.env.AWS_REGION)?.trim();
const bucket = process.env.AWS_S3_BUCKET?.trim();
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const s3 = new S3Client({
  region,
  followRegionRedirects: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function upload(key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  return publicObjectUrl(bucket, region, key);
}

const { data, error } = await db.from("community_pieces").select("id,title,media_url,media_type,poster_url").eq("media_type", "video");
if (error) {
  console.error(error.message);
  process.exit(1);
}

for (const row of data ?? []) {
  const response = await fetch(row.media_url);
  if (!response.ok) {
    console.error(row.title, "download failed", response.status);
    continue;
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const videoKey = decodeURIComponent(new URL(row.media_url).pathname.replace(/^\//, ""));
  const base = videoKey.split("/").pop()?.replace(/\.[^.]+$/, "") || row.id;
  const dir = await mkdtemp(path.join(tmpdir(), "community-frames-"));
  const input = path.join(dir, "source.mp4");
  await writeFile(input, bytes);
  try {
    const { stdout } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", input], { timeout: 20000 });
    const times = stillTimes(Number(String(stdout).trim()));
    const frames = [];
    for (let index = 0; index < times.length; index += 1) {
      const t = times[index];
      const out = path.join(dir, `frame-${index}.jpg`);
      await execFileAsync("ffmpeg", ["-y", "-i", input, "-ss", String(t), "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "3", out], { timeout: 30000 });
      const url = await upload(`community/frames/${base}/${index}.jpg`, await readFile(out), "image/jpeg");
      frames.push({ url, t });
    }
    await upload(`community/frames/${base}/stills.json`, Buffer.from(JSON.stringify(frames)), "application/json");
    const poster = row.poster_url || frames[Math.floor((frames.length - 1) / 2)]?.url || null;
    const update = await db.from("community_pieces").update({ frame_stills: frames, poster_url: poster }).eq("id", row.id);
    const note = update.error ? update.error.message : "saved on the piece";
    console.log(`${row.title}: ${frames.length} stills · ${note}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
