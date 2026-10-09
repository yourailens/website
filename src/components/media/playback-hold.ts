type HoldOptions = {
  /** A focused pause is the viewer hitting pause. Leave it paused. */
  controls?: boolean;
  onPainted?: () => void;
};

type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

/**
 * Browsers drop the decoded video frame when the window is swiped away, so the
 * element flashes grey (or the poster) until the next frame is decoded.
 * Snapshot while the picture is known-good, and on the way back keep that
 * snapshot up until playback time is actually moving again.
 */
export function attachPlaybackHold(
  node: HTMLVideoElement,
  still: HTMLCanvasElement,
  options: HoldOptions = {}
): () => void {
  const video = node as FrameVideo;
  let wantPlay = !node.paused;
  let holding = false;
  let painted = false;
  let token = 0;
  let lastPaint = 0;
  let vfc = 0;
  let timer = 0;
  let disposed = false;
  const scratch = document.createElement("canvas");

  const onScreen = () => {
    const box = node.getBoundingClientRect();
    return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
  };

  const hidden = () => document.visibilityState !== "visible";
  const away = () => hidden() || !document.hasFocus();

  const paint = (force = false) => {
    if (disposed) return false;
    if (!force && (holding || hidden() || node.paused)) return false;
    if (node.readyState < 2 || node.videoWidth < 2 || node.videoHeight < 2) return false;
    const width = node.videoWidth;
    const height = node.videoHeight;
    if (scratch.width !== width) scratch.width = width;
    if (scratch.height !== height) scratch.height = height;
    const buffer = scratch.getContext("2d", { alpha: false });
    if (!buffer) return false;
    try {
      buffer.drawImage(node, 0, 0, width, height);
    } catch {
      return false;
    }
    // The decoder may have already cleared the frame by the time draw returns.
    // Drop that copy so the last good snapshot stays on the visible canvas.
    if (!force && (holding || hidden())) return false;
    if (still.width !== width) still.width = width;
    if (still.height !== height) still.height = height;
    const ctx = still.getContext("2d", { alpha: false });
    if (!ctx) return false;
    ctx.drawImage(scratch, 0, 0);
    if (!painted) {
      painted = true;
      options.onPainted?.();
    }
    return true;
  };

  const show = () => {
    token += 1;
    if (!painted || still.width < 2) return;
    holding = true;
    still.style.opacity = "1";
  };

  const hide = () => {
    holding = false;
    still.style.opacity = "0";
  };

  const schedule = (step: () => void) => {
    if (video.requestVideoFrameCallback) {
      video.requestVideoFrameCallback(step);
      return;
    }
    requestAnimationFrame(step);
  };

  const release = (mine: number, heldTime: number, started: number, frames: number) => {
    if (disposed || mine !== token) return;
    if (document.visibilityState !== "visible") return;
    const elapsed = performance.now() - started;
    const moved = Math.abs(node.currentTime - heldTime) > 0.04;
    if (node.paused) {
      if (elapsed > 800) return;
      schedule(() => release(mine, heldTime, started, frames));
      return;
    }
    const nextFrames = moved ? frames + 1 : frames;
    if ((nextFrames < 2 || node.readyState < 3) && elapsed < 800) {
      schedule(() => release(mine, heldTime, started, nextFrames));
      return;
    }
    paint(true);
    if (mine !== token) return;
    hide();
  };

  const play = () => {
    if (disposed || hidden()) return;
    if (!wantPlay || !onScreen()) {
      hide();
      return;
    }
    const heldTime = node.currentTime;
    show();
    const mine = token;
    const started = performance.now();
    const attempt = node.play();
    const done = () => release(mine, heldTime, started, 0);
    if (attempt && typeof attempt.then === "function") attempt.then(done).catch(() => {});
    else done();
  };

  const onPause = () => {
    if (away()) {
      show();
      return;
    }
    if (!wantPlay) return;
    if (options.controls || !onScreen()) {
      wantPlay = false;
      return;
    }
    const heldTime = node.currentTime;
    show();
    const mine = token;
    const started = performance.now();
    void node.play().then(() => release(mine, heldTime, started, 0)).catch(() => {});
  };

  const onPlay = () => {
    wantPlay = true;
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") play();
    else show();
  };

  const tick = () => {
    if (disposed) return;
    if (!holding && !hidden() && !node.paused) {
      const now = performance.now();
      if (now - lastPaint > 80) {
        if (paint(false)) lastPaint = now;
      }
    }
    if (video.requestVideoFrameCallback) {
      vfc = video.requestVideoFrameCallback(tick);
      return;
    }
    timer = window.setTimeout(tick, 100);
  };

  node.addEventListener("play", onPlay);
  node.addEventListener("pause", onPause);
  document.addEventListener("visibilitychange", onVisibility, true);
  window.addEventListener("blur", show, true);
  window.addEventListener("focus", play, true);
  window.addEventListener("pagehide", show, true);
  window.addEventListener("pageshow", play, true);
  tick();

  return () => {
    disposed = true;
    video.cancelVideoFrameCallback?.(vfc);
    window.clearTimeout(timer);
    node.removeEventListener("play", onPlay);
    node.removeEventListener("pause", onPause);
    document.removeEventListener("visibilitychange", onVisibility, true);
    window.removeEventListener("blur", show, true);
    window.removeEventListener("focus", play, true);
    window.removeEventListener("pagehide", show, true);
    window.removeEventListener("pageshow", play, true);
    still.style.opacity = "0";
  };
}
