"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Service, ServiceCategory } from "@/data/services";
import {
  BADGE_COLORS,
  PRICING_CATEGORY_LABELS,
  PRICING_CATEGORY_ORDER,
  formatPriceFull,
  serviceCardImage,
} from "@/data/services";

function PackageCard({ s }: { s: Service }) {
  const badge = s.badge_label && BADGE_COLORS[s.badge_color ?? "blue"];
  const cover = serviceCardImage(s);
  const accent = s.accent_color ?? "#2563eb";

  return (
    <Link
      href={`/pricing/${s.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/50"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent}22 0%, ${accent}08 55%, #f8fafc 100%)`,
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-end p-6">
            <span className="font-heading text-5xl font-black tracking-tight text-slate-200">
              {formatPriceFull(s.price)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        {badge ? (
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}
          >
            {s.badge_label}
          </span>
        ) : null}
        <p className="absolute bottom-4 left-4 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
          {s.delivery_days} day{s.delivery_days === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-800">
          {s.name}
        </h3>
        {s.tagline ? (
          <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{s.tagline}</p>
        ) : null}

        <ul className="mt-5 space-y-3">
          {s.includes.slice(0, 4).map((item) => (
            <li key={`${item.q}-${item.a}`} className="text-sm">
              <p className="font-semibold text-slate-800">{item.q}</p>
              <p className="mt-0.5 leading-snug text-slate-600">{item.a}</p>
            </li>
          ))}
          {s.includes.length > 4 ? (
            <li className="text-xs font-medium text-slate-400">
              plus {s.includes.length - 4} more in the full package
            </li>
          ) : null}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
          <div>
            <p className="font-heading text-2xl font-black tracking-tight text-slate-900">
              {formatPriceFull(s.price)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{s.unit}</p>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
            View package →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PricingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/services");
        const json = (await res.json()) as {
          services?: Service[];
          categories?: ServiceCategory[];
        };
        if (!cancelled) {
          setServices(json.services ?? []);
          setCategories(json.categories ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(() => {
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    const order = [
      ...PRICING_CATEGORY_ORDER.filter((slug) => services.some((s) => s.category_slug === slug)),
      ...categories
        .map((c) => c.slug)
        .filter(
          (slug) =>
            !(PRICING_CATEGORY_ORDER as readonly string[]).includes(slug) &&
            services.some((s) => s.category_slug === slug)
        ),
    ];

    return order.map((slug) => {
      const cat = bySlug.get(slug);
      return {
        slug,
        name: PRICING_CATEGORY_LABELS[slug] ?? cat?.name ?? slug,
        description: cat?.description ?? null,
        items: services
          .filter((s) => s.category_slug === slug)
          .sort((a, b) => a.sort_order - b.sort_order),
      };
    });
  }, [categories, services]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7fc]">
        <div className="mx-auto w-[92%] max-w-6xl pb-14 pt-8 md:pb-20 md:pt-10">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-blue-100/80 pb-6 md:mb-14">
            <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Pricing
            </h1>
            <div className="flex flex-wrap gap-2">
              <a
                href="#films"
                className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20"
              >
                Films & commercials
              </a>
              <a
                href="#stills"
                className="inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700"
              >
                Images & stills
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center px-2 text-sm font-light italic text-slate-600 underline decoration-blue-300 underline-offset-4"
              >
                Book a free call
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-24">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white/70 px-6 py-20 text-center">
              <p className="text-sm text-slate-500">Packages are being updated. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-20">
              {sections.map((section) => {
                const anchor =
                  section.slug === "videos" ? "films" : section.slug === "visuals" ? "stills" : section.slug;
                return (
                  <section key={section.slug} id={anchor} className="scroll-mt-28">
                    <div className="mb-8 max-w-2xl">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-600">
                        {section.items.length} package{section.items.length === 1 ? "" : "s"}
                      </p>
                      <h2 className="mt-2 font-heading text-3xl font-black tracking-tight text-slate-900">
                        {section.name}
                      </h2>
                      {section.description ? (
                        <p className="mt-3 text-base leading-relaxed text-slate-600">
                          {section.description}
                        </p>
                      ) : null}
                    </div>
                    <div
                      className={`grid gap-6 ${
                        section.items.length === 2
                          ? "md:grid-cols-2"
                          : "md:grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {section.items.map((s) => (
                        <PackageCard key={s.id} s={s} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <div className="mt-20 rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-[#f8fbff] to-[#eef4ff] px-8 py-10 text-center md:px-12">
            <h2 className="font-heading text-2xl font-bold text-slate-900 md:text-3xl">
              Not sure which package fits?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              Tell us the brief and we will map scope, timeline, and the right package, or a custom
              quote if you need something outside these five.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white"
              >
                Book a free call
              </Link>
              <Link
                href="/pricing/estimator"
                className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
              >
                Open estimator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
