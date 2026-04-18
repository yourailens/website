import type { GalleryFilm, GalleryImage } from "@/data/gallery";

function videoType(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDl = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
};

export default function WorkshopMediaBento({
  images,
  films,
}: {
  images: GalleryImage[];
  films: GalleryFilm[];
}) {
  const imgA = images.slice(0, 4);
  const imgB = images.slice(4, 8);
  const filmClips = films.slice(0, 3);

  return (
    <section className="border-b border-blue-100/60 bg-slate-950 py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300/90">From our studio</p>
        <h2 className="mt-2 text-center font-heading text-2xl font-black text-white sm:text-3xl">Real AI films &amp; frames</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-blue-100/80">
          A taste of the image and motion pipelines we unpack in the workshop, pulled live from our gallery.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-4 sm:gap-4">
          {imgA.map((im, i) => (
            <div
              key={im.id ?? `${im.src}-a-${i}`}
              className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg ${
                im.aspect === "portrait" ? "row-span-2 sm:row-span-2" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt={im.title} className="h-full min-h-[140px] w-full object-cover sm:min-h-[180px]" loading="lazy" />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {filmClips.map((f, i) => (
            <div
              key={f.id ?? `${f.src}-f-${i}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl ring-1 ring-white/5"
            >
              <div className="relative aspect-video w-full">
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={f.posterUrl}
                  {...noDl}
                >
                  <source src={f.src} type={videoType(f.src)} />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white drop-shadow">{f.title}</p>
              </div>
            </div>
          ))}
        </div>

        {imgB.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {imgB.map((im, i) => (
              <div key={im.id ?? `${im.src}-b-${i}`} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.title} className="aspect-square w-full object-cover sm:aspect-[4/3]" loading="lazy" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
