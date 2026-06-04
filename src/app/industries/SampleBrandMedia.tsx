"use client";

import Image from "next/image";
import type { SampleBrandMedia as SampleBrandMediaItem } from "@/data/sample-brands";
import { categoryLabel, aspectRatioLabel } from "@/data/sample-brands";
import { aspectRatioClass, resolveMediaType } from "@/lib/sample-brands/media";

export function SampleBrandMediaTile({
  item,
  priority,
  sizes = "(max-width:768px) 100vw, 50vw",
}: {
  item: SampleBrandMediaItem;
  priority?: boolean;
  sizes?: string;
}) {
  const type = resolveMediaType(item.media_type, item.media_url);
  const boxClass = `relative w-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-blue-100/60 ${aspectRatioClass(item.aspect_ratio)}`;

  return (
    <figure className="group">
      <div className={boxClass}>
        {type === "video" ? (
          <video
            src={item.media_url}
            poster={item.poster_url ?? undefined}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
          />
        ) : (
          <Image
            src={item.media_url}
            alt={item.caption ?? item.label ?? "Brand visual"}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes={sizes}
            priority={priority}
            unoptimized
          />
        )}
      </div>
      {(item.label?.trim() || item.caption?.trim()) && (
        <figcaption className="mt-2 flex flex-wrap items-center gap-2 px-0.5">
          {item.label?.trim() ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600/90">
              {item.label.trim()}
            </span>
          ) : null}
          {item.caption?.trim() ? (
            <span className="text-xs font-light text-slate-500">{item.caption.trim()}</span>
          ) : null}
          <span className="ml-auto font-mono text-[9px] text-slate-400">
            {aspectRatioLabel(item.aspect_ratio)}
          </span>
        </figcaption>
      )}
      {!item.label?.trim() && !item.caption?.trim() ? (
        <figcaption className="mt-1.5 px-0.5">
          <span className="text-[10px] font-medium text-slate-400">
            {categoryLabel(item.category)}, {aspectRatioLabel(item.aspect_ratio)}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
