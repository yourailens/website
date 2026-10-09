/**
 * YouTube-style progressive start for progressive MP4/WebM:
 * kick play as soon as the browser has a short buffer (canplay / readyState ≥ 2),
 * and surface waiting/stalled so the UI can show a spinner while more bytes arrive.
 *
 * Does not call video.load() — that would restart the fetch. Just listens and plays early.
 */

type ProgressiveOpts = {
  /** Called when we should attempt play() (enough data or already ready). */
  onReadyToPlay: () => void;
  onBuffering?: (buffering: boolean) => void;
  onFirstFrame?: () => void;
};

export function attachProgressivePlayback(
  video: HTMLVideoElement,
  { onReadyToPlay, onBuffering, onFirstFrame }: ProgressiveOpts
) {
  let firstFrame = false;

  const setBuffering = (value: boolean) => {
    onBuffering?.(value);
  };

  const markFirstFrame = () => {
    if (firstFrame) return;
    firstFrame = true;
    setBuffering(false);
    onFirstFrame?.();
  };

  const onCanPlay = () => {
    setBuffering(false);
    onReadyToPlay();
  };

  const onLoadedData = () => {
    // First frame decoded — start now; the rest keeps downloading while playing.
    onReadyToPlay();
  };

  const onWaiting = () => {
    if (!video.paused) setBuffering(true);
  };

  const onPlaying = () => {
    setBuffering(false);
    markFirstFrame();
  };

  const onSeeking = () => {
    if (video.readyState < 2) setBuffering(true);
  };

  const onSeeked = () => {
    if (video.readyState >= 2) setBuffering(false);
  };

  video.addEventListener("canplay", onCanPlay);
  video.addEventListener("loadeddata", onLoadedData);
  video.addEventListener("waiting", onWaiting);
  video.addEventListener("stalled", onWaiting);
  video.addEventListener("playing", onPlaying);
  video.addEventListener("seeking", onSeeking);
  video.addEventListener("seeked", onSeeked);

  // Prefer progressive fetch of a short lead-in (browser decides how much).
  if (video.preload !== "auto") video.preload = "auto";

  if (video.readyState >= 2) {
    setBuffering(false);
    onReadyToPlay();
  } else if (!video.paused || video.networkState === HTMLMediaElement.NETWORK_LOADING) {
    setBuffering(true);
  } else {
    setBuffering(true);
  }

  return () => {
    video.removeEventListener("canplay", onCanPlay);
    video.removeEventListener("loadeddata", onLoadedData);
    video.removeEventListener("waiting", onWaiting);
    video.removeEventListener("stalled", onWaiting);
    video.removeEventListener("playing", onPlaying);
    video.removeEventListener("seeking", onSeeking);
    video.removeEventListener("seeked", onSeeked);
  };
}
