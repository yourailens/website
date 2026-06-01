"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Service, ServiceAddon, ServiceCategory } from "@/data/services";
import { formatPrice, BADGE_COLORS } from "@/data/services";

// ── Category sidebar item ────────────────────────────────────────────────────
function CategoryItem({
  cat,
  count,
  active,
  onClick,
}: {
  cat: ServiceCategory | { slug: "all"; name: string };
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span className="text-sm font-medium">{cat.name}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ── Service card ─────────────────────────────────────────────────────────────
function ServiceCard({ s }: { s: Service }) {
  const badge = s.badge_label && BADGE_COLORS[s.badge_color ?? "blue"];
  const savings = s.original_price ? s.original_price - s.price : null;

  return (
    <Link
      href={`/pricing/${s.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
    >
      {/* Accent strip */}
      <div
        className="h-1 w-full"
        style={{ background: s.accent_color ?? "#2563eb" }}
      />

      {/* Thumbnail / placeholder */}
      <div
        className="relative flex h-44 w-full items-end overflow-hidden p-4"
        style={{
          background: `linear-gradient(135deg, ${s.accent_color ?? "#2563eb"}18 0%, ${s.accent_color ?? "#2563eb"}06 100%)`,
        }}
      >
        {s.thumbnail_url ? (
          <img
            src={s.thumbnail_url}
            alt={s.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <svg className="h-12 w-12 opacity-10" fill="none" viewBox="0 0 48 48">
            <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
            <path d="M6 18h36M16 10v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}

        {/* Badge */}
        {badge && (
          <span
            className={`relative z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}
          >
            {s.badge_label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Category slug pill */}
        <span className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {s.category_slug.replace("-", " ")}
        </span>

        <h3 className="mb-1 text-[1.05rem] font-bold leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
          {s.name}
        </h3>
        <p className="mb-4 text-xs text-slate-500 line-clamp-2">{s.tagline}</p>

        {/* Includes preview */}
        <ul className="mb-5 flex-1 space-y-1">
          {s.includes.slice(0, 3).map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
              <svg className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
          {s.includes.length > 3 && (
            <li className="text-[11px] font-medium text-blue-500">
              +{s.includes.length - 3} more included
            </li>
          )}
        </ul>

        {/* Footer */}
        <div className="flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{formatPrice(s.price)}</span>
              {s.original_price && (
                <span className="text-xs text-slate-400 line-through">{formatPrice(s.original_price)}</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">{s.unit}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            {savings && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                Save {formatPrice(savings)}
              </span>
            )}
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {s.delivery_days === 1 ? "24hr" : `${s.delivery_days} days`}
            </div>
          </div>
        </div>

        <div
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
          style={{ background: s.accent_color ?? "#2563eb" }}
        >
          View Details
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}


// ── Sort options ──────────────────────────────────────────────────────────────
type SortKey = "featured" | "price-asc" | "price-desc" | "delivery";

function sortServices(list: Service[], key: SortKey) {
  return [...list].sort((a, b) => {
    if (key === "price-asc") return a.price - b.price;
    if (key === "price-desc") return b.price - a.price;
    if (key === "delivery") return a.delivery_days - b.delivery_days;
    // featured: is_popular first, then is_featured, then sort_order
    if (a.is_popular !== b.is_popular) return a.is_popular ? -1 : 1;
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const safeJson = (r: Response) => r.ok ? r.json() : Promise.resolve({});
    Promise.all([
      fetch("/api/services").then(safeJson).catch(() => ({})),
      fetch("/api/service-addons").then(safeJson).catch(() => ({})),
    ]).then(([svData, adData]) => {
      setServices((svData as { services?: typeof services }).services ?? []);
      setCategories((svData as { categories?: typeof categories }).categories ?? []);
      setAddons((adData as { addons?: typeof addons }).addons ?? []);
      setLoading(false);
    });
  }, []);

  const countForCat = useCallback(
    (slug: string) =>
      slug === "all"
        ? services.length
        : services.filter((s) => s.category_slug === slug).length,
    [services]
  );

  const filtered = sortServices(
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category_slug === activeCategory),
    sort
  );

  const allCat = { slug: "all" as const, name: "All Services" };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">
            AI Creative Studio
          </p>
          <h1 className="font-heading text-3xl font-black text-slate-900 sm:text-4xl">
            Services & Pricing
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Not just videos — complete brand creative systems. Reusable assets, repurposable content,
            ad creatives, print, identity and more. Everything a brand actually needs.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">

          {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-6 space-y-1 rounded-2xl border border-slate-200 bg-white p-3">
              <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Categories
              </p>
              <CategoryItem
                cat={allCat}
                count={countForCat("all")}
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {categories.map((c) => (
                <CategoryItem
                  key={c.slug}
                  cat={c}
                  count={countForCat(c.slug)}
                  active={activeCategory === c.slug}
                  onClick={() => setActiveCategory(c.slug)}
                />
              ))}
            </div>

            {/* Add-ons quick list */}
            {addons.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Add-ons
                </p>
                <ul className="space-y-2.5">
                  {addons.map((a) => (
                    <li key={a.slug} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600">{a.name}</span>
                      <span className="whitespace-nowrap text-[11px] font-bold text-slate-800">
                        +{formatPrice(a.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* ── Main content ────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Mobile category scroll */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {[allCat, ...categories].map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === c.slug
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Sort + count row */}
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {loading ? "Loading…" : `${filtered.length} service${filtered.length !== 1 ? "s" : ""}`}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="delivery">Fastest Delivery</option>
              </select>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-96 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <svg className="mb-4 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 40 40">
                  <circle cx="18" cy="18" r="11" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M27 27l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <p className="text-lg font-semibold text-slate-700">No services in this category yet</p>
                <p className="mt-1 text-sm text-slate-400">Try selecting a different category</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </div>
            )}

            {/* Value estimator CTA banner */}
            {!loading && (
              <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-slate-900 p-7 sm:flex-row sm:items-center">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Not sure what you need?
                  </p>
                  <h2 className="text-xl font-black text-white">Estimate your total value</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Mix & match services + add-ons and see exactly what you get vs. what an agency charges.
                  </p>
                </div>
                <Link
                  href="/pricing/estimator"
                  className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                  Open Estimator →
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
