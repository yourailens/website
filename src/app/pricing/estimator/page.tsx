"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Service, ServiceAddon, ServiceCategory } from "@/data/services";
import { formatPrice } from "@/data/services";

type CartItem =
  | { kind: "service"; item: Service; qty: number }
  | { kind: "addon"; item: ServiceAddon; qty: number };

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 12 12">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Sidebar service row ───────────────────────────────────────────────────────
function ServiceRow({
  s,
  inCart,
  onAdd,
  onRemove,
}: {
  s: Service;
  inCart: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
        inCart ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-800">{s.name}</p>
        <p className="text-[10px] text-slate-400">{formatPrice(s.price)}</p>
      </div>
      {inCart ? (
        <button onClick={onRemove} className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100">
          Remove
        </button>
      ) : (
        <button onClick={onAdd} className="shrink-0 rounded-lg border border-blue-200 bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-700">
          Add
        </button>
      )}
    </div>
  );
}

// ── Addon row ────────────────────────────────────────────────────────────────
function AddonRow({
  a,
  inCart,
  onAdd,
  onRemove,
}: {
  a: ServiceAddon;
  inCart: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
        inCart ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-800">{a.name}</p>
        <p className="text-[10px] text-slate-400">+{formatPrice(a.price)}</p>
      </div>
      {inCart ? (
        <button onClick={onRemove} className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100">
          Remove
        </button>
      ) : (
        <button onClick={onAdd} className="shrink-0 rounded-lg border border-violet-200 bg-violet-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-violet-700">
          Add
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EstimatorPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "addons">("services");
  const [catFilter, setCatFilter] = useState<string>("all");

  useEffect(() => {
    const safeJson = (r: Response) => r.ok ? r.json() : Promise.resolve({});
    Promise.all([
      fetch("/api/services").then(safeJson).catch(() => ({})),
      fetch("/api/service-addons").then(safeJson).catch(() => ({})),
    ]).then(([sv, ad]) => {
      setServices((sv as { services?: typeof services }).services ?? []);
      setCategories((sv as { categories?: typeof categories }).categories ?? []);
      setAddons((ad as { addons?: typeof addons }).addons ?? []);
      setLoading(false);
    });
  }, []);

  const addService = (s: Service) =>
    setCart((c) => [...c, { kind: "service", item: s, qty: 1 }]);
  const removeService = (id: string) =>
    setCart((c) => c.filter((x) => !(x.kind === "service" && x.item.id === id)));
  const addAddon = (a: ServiceAddon) =>
    setCart((c) => [...c, { kind: "addon", item: a, qty: 1 }]);
  const removeAddon = (id: string) =>
    setCart((c) => c.filter((x) => !(x.kind === "addon" && x.item.id === id)));

  const cartServices = cart.filter((x): x is CartItem & { kind: "service" } => x.kind === "service");
  const cartAddons = cart.filter((x): x is CartItem & { kind: "addon" } => x.kind === "addon");
  const inCartServiceIds = new Set(cartServices.map((x) => x.item.id));
  const inCartAddonIds = new Set(cartAddons.map((x) => x.item.id));

  const subtotal = cart.reduce((s, x) => s + x.item.price * x.qty, 0);
  const traditionalTotal = cartServices.reduce(
    (s, x) => s + ((x.item as Service).traditional_value ?? x.item.price * 3),
    0
  );
  const savings = Math.max(0, traditionalTotal - subtotal);

  const filteredServices =
    catFilter === "all" ? services : services.filter((s) => s.category_slug === catFilter);

  const serviceCount = cart.filter((x) => x.kind === "service").length;
  const addonCount = cart.filter((x) => x.kind === "addon").length;

  const mailBody = encodeURIComponent(
    `Hi,\n\nI'd like to enquire about the following:\n\n` +
      cartServices.map((x) => `• ${x.item.name} — ${formatPrice(x.item.price)}`).join("\n") +
      (cartAddons.length > 0
        ? `\n\nAdd-ons:\n` + cartAddons.map((x) => `• ${x.item.name} — +${formatPrice(x.item.price)}`).join("\n")
        : "") +
      `\n\nTotal: ${formatPrice(subtotal)}\n\nPlease get in touch.`
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-slate-400 hover:text-blue-600">
              ← Services
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-700">Value Estimator</span>
          </div>
          <h1 className="mt-3 font-heading text-3xl font-black text-slate-900">
            Estimate Your Total Value
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-slate-500">
            Mix and match services and add-ons. See exactly what you get, what it would cost at a
            traditional agency, and how much you save.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* ── LEFT: product picker ──────────────────────────────────── */}
            <div>
              {/* Tabs */}
              <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "services" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Services ({services.length})
                </button>
                <button
                  onClick={() => setActiveTab("addons")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "addons" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Add-ons ({addons.length})
                </button>
              </div>

              {activeTab === "services" && (
                <>
                  {/* Category filter */}
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {[{ slug: "all", name: "All" }, ...categories].map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => setCatFilter(c.slug)}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                          catFilter === c.slug
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {filteredServices.map((s) => (
                      <ServiceRow
                        key={s.id}
                        s={s}
                        inCart={inCartServiceIds.has(s.id)}
                        onAdd={() => addService(s)}
                        onRemove={() => removeService(s.id)}
                      />
                    ))}
                  </div>
                </>
              )}

              {activeTab === "addons" && (
                <div className="space-y-2">
                  {addons.map((a) => (
                    <AddonRow
                      key={a.id}
                      a={a}
                      inCart={inCartAddonIds.has(a.id)}
                      onAdd={() => addAddon(a)}
                      onRemove={() => removeAddon(a.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: sticky summary ─────────────────────────────────── */}
            <aside className="lg:sticky lg:top-6 h-fit space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-black text-slate-900">Your estimate</h2>

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <svg className="mb-3 h-10 w-10 text-slate-200" fill="none" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
                      <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm text-slate-500">Add services and add-ons to start estimating</p>
                  </div>
                ) : (
                  <>
                    {/* Services */}
                    {serviceCount > 0 && (
                      <div className="mb-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Services</p>
                        {cartServices.map((x) => (
                          <div key={x.item.id} className="flex items-center justify-between py-1.5 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckIcon />
                              <span className="truncate text-slate-700">{x.item.name}</span>
                            </div>
                            <span className="shrink-0 font-semibold text-slate-800 ml-2">
                              {formatPrice(x.item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add-ons */}
                    {addonCount > 0 && (
                      <div className="mb-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Add-ons</p>
                        {cartAddons.map((x) => (
                          <div key={x.item.id} className="flex items-center justify-between py-1.5 text-sm">
                            <span className="text-slate-600">{x.item.name}</span>
                            <span className="font-semibold text-slate-700">+{formatPrice(x.item.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Divider + totals */}
                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Your price</span>
                        <span className="text-xl font-black text-slate-900">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Traditional agency</span>
                        <span className="text-slate-400 line-through">{formatPrice(traditionalTotal)}</span>
                      </div>
                    </div>

                    {savings > 0 && (
                      <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center">
                        <p className="text-xs text-emerald-700">You&apos;re saving</p>
                        <p className="text-2xl font-black text-emerald-600">{formatPrice(savings)}</p>
                        <p className="text-[10px] text-emerald-500">
                          {Math.round((savings / traditionalTotal) * 100)}% less than a traditional agency
                        </p>
                      </div>
                    )}


                    {/* What you get */}
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">What you walk away with</p>
                      <ul className="space-y-1">
                        {cartServices.flatMap((x) =>
                          (x.item as Service).deliverables.map((d, i) => (
                            <li key={`${x.item.id}-${i}`} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <CheckIcon />
                              {d}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    <a
                      href={`mailto:hello@yourailens.studio?subject=Estimate Request&body=${mailBody}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                    >
                      Send Enquiry
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </>
                )}
              </div>

              {/* Tip card */}
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center">
                <p className="text-xs text-slate-500">
                  Prices shown are starting estimates. Final quote is confirmed after a brief.
                  <br />
                  <Link href="/pricing" className="mt-1 inline-block text-blue-500 hover:underline">
                    Browse full catalogue →
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
