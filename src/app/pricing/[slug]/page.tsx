"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import type { Service, ServiceAddon } from "@/data/services";
import { formatPrice, BADGE_COLORS } from "@/data/services";

// ── Addon toggle card ─────────────────────────────────────────────────────────
function AddonCard({
  addon,
  selected,
  onToggle,
}: {
  addon: ServiceAddon;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full min-w-0 max-w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
          selected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
        }`}
      >
        {selected && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{addon.icon}</span>
          <span className="text-sm font-semibold text-slate-800">{addon.name}</span>
        </div>
        {addon.description && (
          <p className="mt-0.5 text-[11px] text-slate-500">{addon.description}</p>
        )}
      </div>
      <span className="shrink-0 text-sm font-bold text-slate-800">+{formatPrice(addon.price)}</span>
    </button>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function FAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
      {faqs.map((f, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-semibold text-slate-800">{f.q}</span>
            <span className={`ml-4 shrink-0 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {open === i && (
            <p className="px-5 pb-4 text-sm text-slate-500">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/services/${slug}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return; }
        const d = await r.json();
        setService(d.service);
        setAddons(d.addons ?? []);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const toggleAddon = (addonSlug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(addonSlug)) next.delete(addonSlug);
      else next.add(addonSlug);
      return next;
    });
  };

  const selectedAddons = addons.filter((a) => selected.has(a.slug));
  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = service ? service.price + addonTotal : 0;
  const traditionalTotal = service?.traditional_value
    ? service.traditional_value + selectedAddons.reduce((s, a) => s + a.price * 2, 0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f7f8fc]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-12 w-2/3 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            </div>
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f7f8fc]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 48 48">
            <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2.5" />
            <path d="M33 33l10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <h1 className="text-2xl font-bold text-slate-800">Service not found</h1>
          <Link href="/pricing" className="mt-6 text-blue-600 underline">
            Back to all services
          </Link>
        </div>
      </div>
    );
  }

  const badge = service.badge_label && BADGE_COLORS[service.badge_color ?? "blue"];

  const mailHref = `mailto:hello@yourailens.studio?subject=Enquiry: ${service.name}&body=Hi, I'm interested in ${service.name} (${formatPrice(service.price)}${addonTotal > 0 ? ` + add-ons worth ${formatPrice(addonTotal)}` : ""}). Please get in touch.`;

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden overscroll-none bg-[#f7f8fc]">
      <Navbar />

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <Link
            href="/pricing"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <span className="shrink-0 text-slate-300">/</span>
          <span className="hidden shrink-0 text-xs capitalize text-slate-400 sm:inline">
            {service.category_slug.replace("-", " ")}
          </span>
          <span className="hidden shrink-0 text-slate-300 sm:inline">/</span>
          <span className="min-w-0 truncate text-xs font-medium text-slate-700">{service.name}</span>
        </div>
      </div>

      {/* ── Split view: left scrolls, estimator always visible on the right ─── */}
      <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-1 overflow-hidden">

        {/* LEFT: only this column scrolls */}
        <div className="package-detail-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-x-none overscroll-y-contain px-4 py-10 pb-28 sm:px-6 lg:pr-10 lg:pb-10">
          <div className="mx-auto w-full max-w-full space-y-8">

            {/* Package header image */}
            {service.header_image_url && (
              <div className="relative aspect-[21/9] min-h-[180px] overflow-hidden rounded-2xl bg-slate-200 sm:min-h-[220px] lg:min-h-[280px]">
                <Image
                  src={service.header_image_url}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                  unoptimized={/^https?:\/\//i.test(service.header_image_url)}
                />
              </div>
            )}

            {/* Hero */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 sm:p-8"
              style={{
                background: `linear-gradient(135deg, ${service.accent_color ?? "#2563eb"}22 0%, ${service.accent_color ?? "#2563eb"}08 100%)`,
                borderLeft: `4px solid ${service.accent_color ?? "#2563eb"}`,
              }}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {service.category_slug.replace("-", " ")}
                </span>
                {badge && (
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}>
                    {service.badge_label}
                  </span>
                )}
              </div>
              <h1 className="break-words font-heading text-3xl font-black text-slate-900 sm:text-4xl">
                {service.name}
              </h1>
              <p className="mt-2 text-base text-slate-500">{service.tagline}</p>

              {service.description && (
                <p className="mt-5 max-w-prose text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
              )}

              {service.best_for.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Best for:</span>
                  {service.best_for.map((b) => (
                    <span key={b} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] text-slate-600">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What's included */}
            <div>
              <h2 className="mb-4 text-lg font-black text-slate-900">What&apos;s included</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {service.includes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            {service.deliverables.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-black text-slate-900">You receive</h2>
                <div className="flex flex-wrap gap-2">
                  {service.deliverables.map((d, i) => (
                    <span key={i} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {addons.length > 0 && (
              <div>
                <h2 className="mb-1 text-lg font-black text-slate-900">Customise with Add-ons</h2>
                <p className="mb-4 text-sm text-slate-400">Select what else you need — totals update live on the right.</p>
                <div className="space-y-2.5">
                  {addons.map((a) => (
                    <AddonCard
                      key={a.slug}
                      addon={a}
                      selected={selected.has(a.slug)}
                      onToggle={() => toggleAddon(a.slug)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {service.faqs.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-black text-slate-900">Frequently asked</h2>
                <FAQ faqs={service.faqs} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: fixed panel — always on screen (desktop) */}
        <aside className="hidden h-full min-h-0 w-[340px] shrink-0 flex-col border-l border-slate-200 bg-white lg:flex">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
            {/* Service name + price */}
            <div className="mb-5 border-b border-slate-100 pb-5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {service.category_slug.replace("-", " ")}
              </p>
              <h2 className="mb-3 text-base font-black text-slate-900 leading-snug">{service.name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{formatPrice(service.price)}</span>
                {service.original_price && (
                  <span className="text-sm text-slate-400 line-through">{formatPrice(service.original_price)}</span>
                )}
              </div>
              <span className="text-xs text-slate-400">{service.unit}</span>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Delivered in {service.delivery_days === 1 ? "24 hours" : `${service.delivery_days} days`}
              </div>
            </div>

            {/* Line items */}
            <div className="mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">{service.name}</span>
                <span className="font-semibold text-slate-800">{formatPrice(service.price)}</span>
              </div>
              {selectedAddons.map((a) => (
                <div key={a.slug} className="flex justify-between text-blue-600">
                  <span className="truncate pr-2">+ {a.name}</span>
                  <span className="shrink-0 font-semibold">+{formatPrice(a.price)}</span>
                </div>
              ))}
            </div>

            {/* Total box */}
            <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Your total</span>
                <span className="text-xl font-black text-slate-900">{formatPrice(total)}</span>
              </div>
              {traditionalTotal > 0 && (
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Traditional agency</span>
                  <span className="font-semibold text-slate-400 line-through">{formatPrice(traditionalTotal)}</span>
                </div>
              )}
              {traditionalTotal > total && (
                <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-center text-xs font-bold text-emerald-600">
                  You save {formatPrice(traditionalTotal - total)}
                </div>
              )}
            </div>

            {/* CTA */}
            <a
              href={mailHref}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: service.accent_color ?? "#2563eb" }}
            >
              Get Started
              <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <Link
              href="/pricing/estimator"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Add to estimator
            </Link>

            <p className="mt-4 text-center text-[10px] text-slate-400">
              No contracts. Revisions included. Delivered as agreed.
            </p>
          </div>
        </aside>
      </div>

      {/* ── Mobile bottom bar — fixed to viewport (avoids nested-scroll sideways shift) ─ */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex w-full max-w-lg min-w-0 items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">{formatPrice(total)}</span>
              {addonTotal > 0 && <span className="text-xs text-slate-400">incl. add-ons</span>}
            </div>
            {traditionalTotal > total && (
              <p className="text-[10px] font-semibold text-emerald-600">
                Save {formatPrice(traditionalTotal - total)} vs agency
              </p>
            )}
          </div>
          <a
            href={mailHref}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold text-white"
            style={{ background: service.accent_color ?? "#2563eb" }}
          >
            Get Started
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
