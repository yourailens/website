/** Read natural pixel size from an image or video URL / blob. */
export function readMediaDimensions(
  source: string | Blob,
  kind: "image" | "video"
): Promise<{ width: number; height: number } | null> {
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  const revoke = typeof source !== "string";

  return new Promise((resolve) => {
    const done = (width: number, height: number) => {
      if (revoke) URL.revokeObjectURL(url);
      if (width > 0 && height > 0) resolve({ width, height });
      else resolve(null);
    };
    const fail = () => {
      if (revoke) URL.revokeObjectURL(url);
      resolve(null);
    };

    if (kind === "image") {
      const img = new Image();
      img.onload = () => done(img.naturalWidth, img.naturalHeight);
      img.onerror = fail;
      img.src = url;
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => done(video.videoWidth, video.videoHeight);
    video.onerror = fail;
    video.src = url;
  });
}
