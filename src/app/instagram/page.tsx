import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getInstagramLinks } from "@/lib/social/load";

export const dynamic = "force-dynamic";

export default async function InstagramPage() {
  const links = await getInstagramLinks();
  const morphersTag = "morphers";
  const regularLinks = links.filter((item) => (item.tag ?? "").trim().toLowerCase() !== morphersTag);

  return (
    <div className="relative min-h-screen bg-[#fafbff] text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(#cbd5e1_0.5px,transparent_0.5px)] opacity-[0.25] [background-size:20px_20px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_95%_-10%,rgb(59_130_246/0.1),transparent_55%),radial-gradient(750px_420px_at_0%_100%,rgb(14_165_233/0.08),transparent_50%)]"
        aria-hidden
      />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-6 py-14">
        <section className="relative overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-sky-100/90 via-blue-50/95 to-cyan-50/80 p-7 shadow-lg shadow-blue-100/60 sm:p-10">
          <div
            className="pointer-events-none absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-300/25 via-blue-300/15 to-transparent blur-2xl"
            aria-hidden
          />
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-200/80 bg-white/80 px-4 py-2 backdrop-blur-sm">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515bd4] text-white shadow-md shadow-pink-200/70">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
                  <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="5.25" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
                </svg>
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-blue-700/70">Social</p>
            </div>
            <h1 className="mt-4 font-heading text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Instagram
              <span className="ml-3 inline-block align-middle text-2xl sm:text-3xl">✦</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Curated links to featured Instagram posts. Same brand palette as your gallery pages, with a clean editorial list layout.
            </p>
            <div className="mt-4">
              <Link
                href="https://instagram.com/yourailens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-800 transition hover:border-blue-300 hover:bg-blue-50"
              >
                @yourailens
              </Link>
            </div>
          </div>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-blue-200/80 shadow-xl shadow-blue-100/70">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mc.webp')" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-blue-900/55 to-cyan-800/35" aria-hidden />
          <div className="relative px-6 py-10 text-white sm:px-10 sm:py-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-100/90">Featured Collection</p>
            <h2 className="mt-2 font-heading text-3xl font-black tracking-tight sm:text-4xl">Morphers</h2>
            <p className="mt-2 max-w-xl text-sm text-blue-50/95 sm:text-base">
              Morphers-tagged Instagram posts live in a dedicated section.
            </p>
            <Link
              href="/instagram/morphers"
              className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-blue-800 transition hover:bg-blue-50"
            >
              Open Morphers Section
            </Link>
          </div>
        </section>

        {regularLinks.length === 0 ? (
          <p className="mt-10 text-sm text-slate-500">No Instagram links yet. Add them in admin.</p>
        ) : (
          <ul className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {regularLinks.map((item, index) => (
              <li
                key={item.id}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-blue-100/90 bg-white shadow-md shadow-blue-100/60 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-200/60"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                  {item.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 px-6 text-center">
                      <p className="text-sm font-semibold text-blue-700/70">Instagram preview</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-600/70">
                    Post {String(index + 1).padStart(2, "0")}
                  </p>
                  {item.tag ? <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-800">#{item.tag}</p> : null}
                  <p className="mt-2 line-clamp-2 font-heading text-xl font-black text-slate-900">{item.title}</p>
                  <p className="mt-2 line-clamp-2 break-all font-mono text-[11px] text-slate-500">{item.url}</p>
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-fit items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition group-hover:bg-blue-700"
                  >
                    Open post
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
