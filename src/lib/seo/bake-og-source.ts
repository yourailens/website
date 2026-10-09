/** Pure helpers for picking an OG source image — no sharp / native deps. */

export function mediaSourceForOg(opts: {
  poster_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  youtubeThumb?: string | null;
}): string {
  if (opts.poster_url?.trim()) return opts.poster_url.trim();
  if (opts.youtubeThumb?.trim()) return opts.youtubeThumb.trim();
  if (opts.media_type === "image" && opts.media_url?.trim()) return opts.media_url.trim();
  return "";
}
