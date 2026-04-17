import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";

const DEFAULT_MAX_MB = 200;

function inferFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const seg = pathname.split("/").filter(Boolean).pop();
    if (seg && /\./.test(seg)) return seg;
  } catch {
    /* ignore */
  }
  return "video.mp4";
}

export type DownloadVideoResult = {
  path: string;
  cleanup: () => Promise<void>;
};

/**
 * Streams a remote video to a temp file with a byte cap (avoids loading huge files into RAM).
 */
export async function downloadVideoToTempFile(
  url: string,
  options?: { maxBytes?: number; timeoutMs?: number }
): Promise<DownloadVideoResult> {
  const maxMb = Number(process.env.FILM_POSTER_MAX_VIDEO_MB ?? String(DEFAULT_MAX_MB));
  const maxBytes = options?.maxBytes ?? (Number.isFinite(maxMb) && maxMb > 0 ? maxMb * 1024 * 1024 : DEFAULT_MAX_MB * 1024 * 1024);
  const timeoutMs = options?.timeoutMs ?? 120_000;

  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    throw new Error(`Failed to fetch video: HTTP ${res.status}`);
  }
  const ct = (res.headers.get("content-type") ?? "").toLowerCase();
  if (ct.includes("text/html")) {
    throw new Error("That URL returned HTML, not a video file. Use a direct link to the video file (e.g. your S3 URL).");
  }

  const cl = res.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > maxBytes) {
      throw new Error(
        `Video is too large (${Math.round(n / 1024 / 1024)} MB, max ${Math.round(maxBytes / 1024 / 1024)} MB).`
      );
    }
  }
  if (!res.body) {
    throw new Error("Empty response body");
  }

  const dir = join(tmpdir(), `film-src-${randomBytes(8).toString("hex")}`);
  const dest = join(dir, inferFilenameFromUrl(url));
  await mkdir(dir, { recursive: true });

  let received = 0;
  const counter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      received += chunk.length;
      if (received > maxBytes) {
        cb(
          new Error(`Video exceeds ${Math.round(maxBytes / 1024 / 1024)} MB while downloading (set FILM_POSTER_MAX_VIDEO_MB to raise).`)
        );
        return;
      }
      cb(null, chunk);
    },
  });

  const nodeReadable = Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]);
  const write = createWriteStream(dest);
  try {
    await pipeline(nodeReadable, counter, write);
  } catch (e) {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
    throw e;
  }

  return {
    path: dest,
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
}
