import type { GalleryFilm, GalleryImage } from "@/data/gallery";

function videoType(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDl = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
};

export default function WorkshopDayInline({
  images,
  film,
  label,
}: {
  images: GalleryImage[];
  film: GalleryFilm | null;
  label: string;
}) {
  return (
    <div className="mb-10 grid gap-4 sm:grid-cols-3">
      {images.slice(0, 2).map((im, i) => (
        <div
          key={im.id ?? `${im.src}-inline-${i}`}
          className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-100 shadow-md"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={im.src} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
        </div>
      ))}
      {film ? (
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-black shadow-lg sm:col-span-1">
          <div className="relative aspect-video w-full">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              {...noDl}
            >
              <source src={film.src} type={videoType(film.src)} />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-3 text-[11px] font-bold uppercase tracking-wider text-white/90">{label}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
