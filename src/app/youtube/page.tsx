import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getYoutubeLinks } from "@/lib/social/load";

export const dynamic = "force-dynamic";

export default async function YoutubePage() {
  const links = await getYoutubeLinks();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/90 via-white to-sky-50/50 text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(1000px_560px_at_0%_30%,rgb(59_130_246/0.1),transparent_52%)]"
        aria-hidden
      />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-6 py-14">
        <section className="overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-900 via-blue-800 to-sky-700 p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-blue-200/70">Social</p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight sm:text-5xl">YouTube</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100/80 sm:text-base">
            Featured videos in a cinematic blue tone inspired by your films page. Tap any entry to jump directly to the video.
          </p>
        </section>

        {links.length === 0 ? (
          <p className="mt-10 text-sm text-slate-500">No YouTube links yet.</p>
        ) : (
          <ul className="mt-9 space-y-5">
            {links.map((item, index) => (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border border-blue-100/80 bg-white p-4 shadow-md shadow-blue-100/60 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-200/70 sm:p-5"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/55 via-transparent to-cyan-50/45 opacity-0 transition group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4 md:flex-row md:items-stretch">
                  <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 md:w-[48%]">
                    <div className="aspect-video w-full">
                      {item.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 px-6 text-center">
                          <p className="text-sm font-semibold text-blue-800/70">YouTube thumbnail</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-600/70">
                      Video {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 line-clamp-2 font-heading text-xl font-black text-slate-900 sm:text-2xl">{item.title}</p>
                    <p className="mt-2 line-clamp-2 break-all font-mono text-[11px] text-slate-500">{item.url}</p>
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-800"
                    >
                      Open video
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
