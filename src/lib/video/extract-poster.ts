import { spawn } from "node:child_process";
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
  return ".mp4";
}

/**
 * Extract ~0.5s frame from video bytes, resize to OG card size, return JPEG buffer.
 * Returns null if ffmpeg is unavailable or extraction fails.
 */
export async function extractFilmPosterJpeg(video: Buffer, filename: string): Promise<Buffer | null> {
  const bin = process.env.FFMPEG_PATH?.trim() || ffmpegPath;
  if (!bin) return null;

  const dir = join(tmpdir(), `film-poster-${randomBytes(8).toString("hex")}`);
  const ext = pickTempExt(filename);
  const inputPath = join(dir, `input${ext}`);
  const pngPath = join(dir, "frame.png");

  await mkdir(dir, { recursive: true });
  await writeFile(inputPath, video);

  try {
    const code = await new Promise<number>((resolve, reject) => {
      const ff = spawn(
        bin,
        [
          "-y",
          "-hide_banner",
          "-loglevel",
          "error",
          "-ss",
          "0.5",
          "-i",
          inputPath,
          "-frames:v",
          "1",
          "-q:v",
          "2",
          pngPath,
        ],
        { stdio: ["ignore", "ignore", "pipe"] },
      );
      let err = "";
      ff.stderr?.on("data", (d: Buffer) => {
        err += d.toString();
      });
      ff.on("error", reject);
      ff.on("close", (c) => resolve(c ?? 1));
    });

    if (code !== 0) return null;

    const png = await readFile(pngPath);
    return await sharp(png)
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
