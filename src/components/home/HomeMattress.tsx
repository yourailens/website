"use client";

import { DeferredVideo } from "@/components/media/DeferredVideo";

type HomeMattressProps = {
  src?: string | null;
  poster?: string | null;
  youtubeId?: string | null;
};

export default function HomeMattress({ src, poster, youtubeId }: HomeMattressProps) {
  const youtubeSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&playsinline=1&rel=0`
    : null;

  return (
    <section
      aria-label="The mattress ad"
      className="relative aspect-video w-full bg-black md:aspect-auto md:h-[100svh] md:min-h-[560px]"
    >
      {youtubeSrc ? (
        <iframe
          src={youtubeSrc}
          title="The mattress ad"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      ) : src ? (
        <DeferredVideo
          src={src}
          poster={poster}
          eager
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : poster ? (
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent md:h-36" />
    </section>
  );
}
