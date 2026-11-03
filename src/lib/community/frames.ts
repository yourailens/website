import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { parseCommunityFrames, type CommunityFrame } from "@/data/community";
import { readObjectFromS3, uploadObjectToS3 } from "@/lib/s3/client";
import { getS3Env } from "@/lib/s3/config";
import { tryS3ObjectKeyFromUrl } from "@/lib/s3/keys";

const execFileAsync = promisify(execFile);
const STILL_COUNT = 5;

function stillTimes(duration: number) {
  const safe = Number.isFinite(duration) && duration > 0.4 ? duration : 8;
  const start = Math.min(0.6, safe * 0.06);
  const end = Math.max(start + 0.2, safe - Math.min(0.45, safe * 0.06));
  return Array.from({ length: STILL_COUNT }, (_, index) => {
    const span = end - start;
    const t = start + (span * index) / (STILL_COUNT - 1);
    return Math.round(t * 100) / 100;
  });
}

/** Pull a handful of jpeg frames once. Returns [] when ffmpeg is unavailable. */
export async function extractVideoStills(bytes: Buffer, ext: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "community-frames-"));
  const input = path.join(dir, `source.${ext.replace(/^\./, "") || "mp4"}`);
  await writeFile(input, bytes);
  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", input],
      { timeout: 20000 }
    );
    const times = stillTimes(Number(String(stdout).trim()));
    const stills: { t: number; jpeg: Buffer }[] = [];
    for (const t of times) {
      const out = path.join(dir, `frame-${t}.jpg`);
      await execFileAsync(
        "ffmpeg",
        ["-y", "-i", input, "-ss", String(t), "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "3", out],
        { timeout: 30000 }
      );
      stills.push({ t, jpeg: await readFile(out) });
    }
    return stills;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function framesPrefix(videoKey: string) {
  const base = videoKey.split("/").pop()?.replace(/\.[^.]+$/, "") || "clip";
  return `community/frames/${base}`;
}

export async function uploadCommunityStills(
  videoKey: string,
  stills: { t: number; jpeg: Buffer }[]
): Promise<CommunityFrame[]> {
  const prefix = framesPrefix(videoKey);
  const frames: CommunityFrame[] = [];
  for (let index = 0; index < stills.length; index += 1) {
    const uploaded = await uploadObjectToS3(
      `${prefix}/${index}.jpg`,
      stills[index].jpeg,
      "image/jpeg"
    );
    frames.push({ url: uploaded.publicUrl, t: stills[index].t });
  }
  await uploadObjectToS3(
    `${prefix}/stills.json`,
    Buffer.from(JSON.stringify(frames)),
    "application/json"
  );
  return frames;
}

export function coverStill(frames: CommunityFrame[]) {
  if (!frames.length) return null;
  return frames[Math.floor((frames.length - 1) / 2)] ?? frames[0];
}

/** Saved stills for a community video, keyed beside the original object. */
export async function readCommunityStills(mediaUrl: string): Promise<CommunityFrame[]> {
  const env = getS3Env();
  if (!env) return [];
  const videoKey = tryS3ObjectKeyFromUrl(mediaUrl, env.bucket);
  if (!videoKey) return [];
  const raw = await readObjectFromS3(`${framesPrefix(videoKey)}/stills.json`);
  if (!raw) return [];
  try {
    return parseCommunityFrames(JSON.parse(raw.toString("utf8")));
  } catch {
    return [];
  }
}
