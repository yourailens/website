import { spawn } from "node:child_process";
import { chmod } from "node:fs/promises";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

function pickTempExt(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mov")) return ".mov";
  if (lower.endsWith(".webm")) return ".webm";
  if (lower.endsWith(".mkv")) return ".mkv";
  return ".mp4";
}

export type ExtractPosterResult =
  | { ok: true; jpeg: Buffer }
  | { ok: false; reason: string };

async function runFfmpegFrameToPng(bin: string, inputPath: string, pngPath: string): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const ff = spawn(
      bin,
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        "1",
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-frames:v",
        "1",
        pngPath,
      ],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
    let stderr = "";
    ff.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    ff.on("error", reject);
    ff.on("close", (c) => resolve({ code: c ?? 1, stderr }));
  });
}

/** Second attempt: seek after decode (slower; works better for some MP4/MOV). */
async function runFfmpegFrameToPngSeekAfter(bin: string, inputPath: string, pngPath: string): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const ff = spawn(
      bin,
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        inputPath,
        "-ss",
        "1",
        "-map",
        "0:v:0",
        "-frames:v",
        "1",
        pngPath,
      ],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
    let stderr = "";
    ff.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    ff.on("error", reject);
    ff.on("close", (c) => resolve({ code: c ?? 1, stderr }));
  });
}

async function jpegFromPngPath(pngPath: string): Promise<Buffer> {
  const png = await readFile(pngPath);
  return sharp(png)
    .rotate()
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

async function extractPosterFromVideoFile(bin: string, videoInputPath: string, pngPath: string): Promise<ExtractPosterResult> {
  let lastErr = "";
  let r = await runFfmpegFrameToPng(bin, videoInputPath, pngPath);
  if (r.code !== 0) {
    lastErr = r.stderr.slice(-800);
    r = await runFfmpegFrameToPngSeekAfter(bin, videoInputPath, pngPath);
  }
  if (r.code !== 0) {
    return {
      ok: false,
      reason: `ffmpeg exit ${r.code}: ${(r.stderr || lastErr).slice(-1200) || "unknown"}`,
    };
  }
  try {
    const jpeg = await jpegFromPngPath(pngPath);
    return { ok: true, jpeg };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg.slice(0, 500) };
  }
}

async function resolveFfmpegBin(): Promise<string | null> {
  const bin = process.env.FFMPEG_PATH?.trim() || ffmpegPath;
  if (!bin) return null;
  try {
    await chmod(bin, 0o755);
  } catch {
    /* Windows or read-only FS */
  }
  return bin;
}

/**
 * Extract ~1s frame from video bytes, resize to OG card size, return JPEG.
 */
export async function extractFilmPosterJpeg(video: Buffer, filename: string): Promise<ExtractPosterResult> {
  const bin = await resolveFfmpegBin();
  if (!bin) {
    return { ok: false, reason: "No ffmpeg binary (set FFMPEG_PATH or install ffmpeg-static)." };
  }

  const dir = join(tmpdir(), `film-poster-${randomBytes(8).toString("hex")}`);
  const ext = pickTempExt(filename);
  const inputPath = join(dir, `input${ext}`);
  const pngPath = join(dir, "frame.png");

  await mkdir(dir, { recursive: true });
  await writeFile(inputPath, video);

  try {
    const result = await extractPosterFromVideoFile(bin, inputPath, pngPath);
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg.slice(0, 500) };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Extract poster from an existing video file on disk (does not delete `videoPath`).
 */
export async function extractFilmPosterJpegFromPath(videoPath: string): Promise<ExtractPosterResult> {
  const bin = await resolveFfmpegBin();
  if (!bin) {
    return { ok: false, reason: "No ffmpeg binary (set FFMPEG_PATH or install ffmpeg-static)." };
  }

  const workDir = join(tmpdir(), `film-poster-work-${randomBytes(8).toString("hex")}`);
  const pngPath = join(workDir, "frame.png");
  await mkdir(workDir, { recursive: true });

  try {
    return await extractPosterFromVideoFile(bin, videoPath, pngPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg.slice(0, 500) };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
