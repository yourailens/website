"use client";

import Image from "next/image";
import { coverAspectClass } from "@/data/module-covers";
import type { FutureMediaType } from "@/data/the-future";
import type { ModuleCoverAspectId } from "@/data/module-covers";

type Props = {
  mediaType: FutureMediaType;
  imageUrl?: string | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  aspectRatio: ModuleCoverAspectId;
  alt: string;
  priority?: boolean;
  className?: string;
};

export default function FutureMediaBlock({
  mediaType,
  imageUrl,
  videoUrl,
  posterUrl,
  aspectRatio,
  alt,
  priority,
  className = "",
}: Props) {
  const aspect = coverAspectClass(aspectRatio);
  const url = mediaType === "video" ? videoUrl : imageUrl;

  if (!url?.trim()) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 ${aspect} ${className}`}
      >
        <span className="text-sm font-medium text-slate-400">Media coming soon</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 ${aspect} ${className}`}>
      {mediaType === "video" ? (
        <video
          src={url}
          poster={posterUrl?.trim() || undefined}
          controls
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <Image src={url} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" priority={priority} unoptimized />
      )}
    </div>
  );
}
