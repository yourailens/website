/**
 * Capture a JPEG still from a local video Blob (admin upload path).
 * Runs in the browser — no ffmpeg on the server.
 */
export function captureVideoPosterBlob(file: Blob, seekSeconds = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.src = url;

    let settled = false;
    const finish = (err?: Error, blob?: Blob) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
      if (err) reject(err);
      else if (blob) resolve(blob);
      else reject(new Error("Could not capture poster"));
    };

    const timeout = window.setTimeout(() => finish(new Error("Poster capture timed out")), 20000);

    video.addEventListener(
      "loadeddata",
      () => {
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
        const t = Math.min(Math.max(0.05, seekSeconds), Math.max(0.05, dur * 0.12));
        try {
          video.currentTime = t;
        } catch {
          window.clearTimeout(timeout);
          finish(new Error("Could not seek video"));
        }
      },
      { once: true }
    );

    video.addEventListener(
      "seeked",
      () => {
        try {
          const w = video.videoWidth || 1280;
          const h = video.videoHeight || 720;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            window.clearTimeout(timeout);
            finish(new Error("Canvas unavailable"));
            return;
          }
          ctx.drawImage(video, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              window.clearTimeout(timeout);
              if (blob && blob.size > 0) finish(undefined, blob);
              else finish(new Error("Empty poster"));
            },
            "image/jpeg",
            0.88
          );
        } catch (e) {
          window.clearTimeout(timeout);
          finish(e instanceof Error ? e : new Error("Poster draw failed"));
        }
      },
      { once: true }
    );

    video.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeout);
        finish(new Error("Video failed to load for poster"));
      },
      { once: true }
    );
  });
}
