import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getInstagramLinks } from "@/lib/social/load";

export const dynamic = "force-dynamic";

export default async function InstagramMorphersPage() {
  const links = await getInstagramLinks("Morphers");

  return (
    <div className="relative min-h-screen bg-[#f8fbff] text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(#bfdbfe_0.5px,transparent_0.5px)] opacity-[0.25] [background-size:20px_20px]"
        aria-hidden
      />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-6 py-14">
        <section className="relative overflow-hidden rounded-3xl border border-blue-200/80 shadow-lg shadow-blue-100/60">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mh.png')" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-blue-950/30 to-cyan-900/15" aria-hidden />
          <div className="relative p-7 text-white sm:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-blue-700/60">Instagram Subpage</p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight sm:text-5xl">Morphers</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100/90 sm:text-base">
            Only Instagram links tagged as Morphers are shown here.
          </p>
          <div className="mt-5">
            <Link
              href="/instagram"
              className="inline-flex items-center rounded-full border border-white/35 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              Back to Instagram
            </Link>
          </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-amber-300/60 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-6 shadow-xl shadow-amber-100/60 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-800/80">Creative Disclaimer</p>
          <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Artistic, Non-Commercial Fan Expression</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-700 sm:text-base">
            This content is created solely for artistic and entertainment purposes. We are not affiliated with, endorsed by,
            or authorized by BLACKPINK or its members. These videos are experimental, AI-driven filmmaking studies inspired by
            public cultural aesthetics, and are presented strictly as non-commercial creative work with no monetization intent.
          </p>
        </section>

        {links.length === 0 ? (
          <p className="mt-10 text-sm text-slate-500">No Morphers Instagram links yet. Add links with tag `Morphers` in admin.</p>
        ) : (
          <ul className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {links.map((item, index) => (
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
                      <p className="text-sm font-semibold text-blue-700/70">Morphers preview</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-600/70">
                    Post {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-800">#Morphers</p>
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
