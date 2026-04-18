import type { SocialLink } from "@/lib/social/load";

export default function WorkshopInstagramRow({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <section className="border-b border-blue-100/50 bg-gradient-to-b from-white to-blue-50/40 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-pink-600/90">Instagram</p>
        <h2 className="mt-2 text-center font-heading text-xl font-black text-slate-900 sm:text-2xl">Motion &amp; drops from the feed</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin sm:gap-5">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-[min(200px,72vw)] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {l.thumbnail_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={l.thumbnail_url}
                  alt={l.title}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-pink-100 to-indigo-100 p-4 text-center text-xs font-semibold text-slate-700">
                  {l.title}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10">
                <p className="line-clamp-2 text-[12px] font-bold text-white">{l.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
