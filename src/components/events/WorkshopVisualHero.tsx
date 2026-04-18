import type { GalleryFilm } from "@/data/gallery";

const noDl = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
};

function videoType(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

export default function WorkshopVisualHero({ heroFilm }: { heroFilm: GalleryFilm | null }) {
  if (!heroFilm) {
    return (
      <div
        className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_20%,rgb(30_58_138/0.5),transparent_55%),linear-gradient(180deg,rgb(15_23_42/0.2),rgb(15_23_42/0.85))]"
        aria-hidden
      />
    );
  }

  return (
    <>
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={heroFilm.posterUrl}
        aria-hidden
        {...noDl}
      >
        <source src={heroFilm.src} type={videoType(heroFilm.src)} />
      </video>
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-blue-950/45 to-slate-950/90"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_0%,rgb(59_130_246/0.25),transparent_50%)]" aria-hidden />
    </>
  );
}
