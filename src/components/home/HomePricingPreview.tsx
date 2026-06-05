import Image from "next/image";
import Link from "next/link";
import HomeBlueTint from "@/components/home/HomeBlueTint";

const PAGE = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";
const HERO_IMAGE = "/images/call.png";

const PACKAGE_NEEDS = [
  {
    title: "Launch & campaign",
    description:
      "Hero films, teasers, and launch-day cuts when you need one strong moment in market.",
  },
  {
    title: "Always-on content",
    description:
      "Monthly packs for social, ads, and product stories — without hiring a full studio.",
  },
  {
    title: "Product & brand assets",
    description:
      "Stills, variants, and platform-ready creatives locked to your brand identity.",
  },
] as const;

export default function HomePricingPreview() {
  return (
    <HomeBlueTint
      id="packages"
      className="scroll-mt-24 border-t border-blue-100/60 py-10 pb-12 sm:py-12 sm:pb-16 lg:pt-16 lg:pb-24"
    >
      <div className={PAGE}>
        <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
          <div className="h-px w-6 bg-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500">Packages</span>
        </div>

        <h2
          className="max-w-3xl font-body text-[1.65rem] font-black leading-[1.08] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          Packages that fit
          <br />
          <span className="text-blue-600">the way you work.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] font-medium leading-relaxed text-slate-700 sm:mt-4 sm:text-sm">
          From a single launch to an always-on content engine — pick a package shaped around your brief. Browse
          pricing or map scope with the estimator.
        </p>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 lg:mt-12 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:gap-10">
          {/* Image panel */}
          <div className="relative flex min-w-0 flex-col">
            <div
              className="pointer-events-none absolute -inset-2 rounded-[1.25rem] bg-gradient-to-br from-blue-400/20 via-cyan-300/10 to-indigo-400/15 blur-md sm:-inset-3 sm:rounded-[1.35rem]"
              aria-hidden
            />
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-blue-200/80 bg-white p-1.5 shadow-lg shadow-blue-200/25 ring-1 ring-blue-100/80 sm:p-2">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl bg-slate-900 sm:aspect-[16/11] lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src={HERO_IMAGE}
                  alt="Book a call with YourAILens to find the right production package"
                  fill
                  className="object-cover object-[72%_28%] sm:object-[65%_30%] lg:object-center"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent sm:from-slate-950/70 sm:via-slate-950/15" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/80 sm:text-[10px] sm:tracking-[0.24em]">
                    Production packages
                  </p>
                  <p className="mt-0.5 font-body text-base font-bold text-white sm:mt-1 sm:text-lg lg:text-xl">
                    Fixed scope. Clear deliverables.
                  </p>
                  <p className="mt-1.5 hidden text-sm font-medium text-white/85 sm:mt-2 sm:block sm:max-w-sm">
                    Films, stills, and campaign assets from one brief — delivered on your timeline.
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-col gap-2 px-0.5 pb-0.5 sm:mt-3 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 sm:min-h-0 sm:w-auto sm:flex-none"
                >
                  Browse all packages
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/pricing/estimator"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700 active:bg-slate-50 sm:min-h-0 sm:w-auto sm:flex-none"
                >
                  Build an estimate
                </Link>
              </div>
            </div>
          </div>

          {/* Needs list */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p className="border-b border-slate-100 bg-slate-50/90 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 sm:px-5 sm:py-3.5 sm:tracking-[0.22em]">
              Built for different needs
            </p>
            <ul className="flex-1 divide-y divide-slate-100">
              {PACKAGE_NEEDS.map((item, i) => (
                <li key={item.title} className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-mono text-[11px] font-bold text-blue-700 sm:h-8 sm:w-8 sm:text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-body text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-700 sm:mt-1.5 sm:text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-blue-100 bg-blue-50/50 px-4 py-3.5 sm:px-5 sm:py-4 lg:px-6">
              <p className="text-[13px] font-medium leading-relaxed text-slate-800 sm:text-sm">
                Not sure which path fits?{" "}
                <Link href="/contact" className="font-bold text-blue-700 hover:underline">
                  Book a free call
                </Link>{" "}
                <span className="text-slate-600">— we&apos;ll match the right package to your goals.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </HomeBlueTint>
  );
}
