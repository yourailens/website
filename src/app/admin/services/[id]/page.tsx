"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/data/services";

function remoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{children}</label>;
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
  );
}

// Editable list of strings (includes / deliverables / best_for)
function StringListEditor({ label, items, onChange }: {
  label: string; items: string[]; onChange: (v: string[]) => void;
}) {
  const add = () => onChange([...items, ""]);
  const update = (i: number, v: string) => { const n = [...items]; n[i] = v; onChange(n); };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button onClick={() => remove(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
              ×
            </button>
          </div>
        ))}
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">+</span>
          Add item
        </button>
      </div>
    </div>
  );
}

// Editable FAQ list
function FaqEditor({ faqs, onChange }: {
  faqs: { q: string; a: string }[]; onChange: (v: { q: string; a: string }[]) => void;
}) {
  const add = () => onChange([...faqs, { q: "", a: "" }]);
  const update = (i: number, field: "q" | "a", v: string) => {
    const n = [...faqs]; n[i] = { ...n[i], [field]: v }; onChange(n);
  };
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>FAQs</Label>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FAQ {i + 1}</span>
              <button onClick={() => remove(i)} className="text-xs text-slate-400 hover:text-red-500">Remove</button>
            </div>
            <input
              value={faq.q}
              onChange={(e) => update(i, "q", e.target.value)}
              placeholder="Question"
              className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
            <textarea
              value={faq.a}
              onChange={(e) => update(i, "a", e.target.value)}
              placeholder="Answer"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        ))}
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">+</span>
          Add FAQ
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headerUploading, setHeaderUploading] = useState(false);
  const headerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/services/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setService(d.service);
        setForm(d.service ?? {});
      });
  }, [id]);

  const set = (key: keyof Service, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const uploadHeader = async (file: File) => {
    if (!id) return;
    setHeaderUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("serviceId", id);
      const res = await fetch("/api/admin/services/upload-header", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      set("header_image_url", json.url);
      setForm((prev) => ({ ...prev, header_image_url: json.url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setHeaderUploading(false);
    }
  };

  const clearHeader = async () => {
    if (!id || !confirm("Remove package header image?")) return;
    setHeaderUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/upload-header?serviceId=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove image");
      set("header_image_url", null);
      setForm((prev) => ({ ...prev, header_image_url: null }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setHeaderUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/services" className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Services
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-900">{service.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {error && <p className="text-xs text-red-500">{error}</p>}
            {saved && <p className="text-xs font-semibold text-emerald-600">Saved!</p>}
            <Link href={`/pricing/${service.slug}`} target="_blank" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Preview →
            </Link>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">

            {/* Basic info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Basic Info</h2>
              <div className="space-y-4">
                <div>
                  <Label>Service Name</Label>
                  <Input value={form.name ?? ""} onChange={(v) => set("name", v)} placeholder="e.g. Campaign Sprint" />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input value={form.slug ?? ""} onChange={(v) => set("slug", v)} placeholder="e.g. campaign-sprint" />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={form.tagline ?? ""} onChange={(v) => set("tagline", v)} placeholder="Short one-liner" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description ?? ""} onChange={(v) => set("description", v)} placeholder="Full description shown on the package page" rows={4} />
                </div>
                <div>
                  <Label>Category Slug</Label>
                  <Input value={form.category_slug ?? ""} onChange={(v) => set("category_slug", v)} placeholder="e.g. campaigns" />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (₹)</Label>
                  <Input type="number" value={form.price ?? 0} onChange={(v) => set("price", Number(v))} />
                </div>
                <div>
                  <Label>Traditional Value (₹)</Label>
                  <Input type="number" value={form.traditional_value ?? ""} onChange={(v) => set("traditional_value", v ? Number(v) : null)} placeholder="Agency equivalent cost" />
                </div>
                <div>
                  <Label>Unit label</Label>
                  <Input value={form.unit ?? ""} onChange={(v) => set("unit", v)} placeholder="e.g. per campaign" />
                </div>
                <div>
                  <Label>Delivery (days)</Label>
                  <Input type="number" value={form.delivery_days ?? 2} onChange={(v) => set("delivery_days", Number(v))} />
                </div>
              </div>
            </div>

            {/* Includes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">What&apos;s Included</h2>
              <StringListEditor label="Includes" items={form.includes ?? []} onChange={(v) => set("includes", v)} />
            </div>

            {/* Deliverables */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Deliverables</h2>
              <StringListEditor label="Deliverables" items={form.deliverables ?? []} onChange={(v) => set("deliverables", v)} />
            </div>

            {/* Best for */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Best For</h2>
              <StringListEditor label="Best for" items={form.best_for ?? []} onChange={(v) => set("best_for", v)} />
            </div>

            {/* FAQs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">FAQs</h2>
              <FaqEditor faqs={form.faqs ?? []} onChange={(v) => set("faqs", v)} />
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Status</h2>
              <div className="space-y-3">
                {(["is_published", "is_popular", "is_featured"] as const).map((key) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between">
                    <span className="text-sm font-medium capitalize text-slate-700">
                      {key.replace("is_", "").replace("_", " ")}
                    </span>
                    <div
                      onClick={() => set(key, !form[key])}
                      className={`relative h-5 w-9 rounded-full transition-colors ${form[key] ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${form[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Package header image */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-slate-900">Package header</h2>
              <p className="mb-4 text-xs text-slate-500">
                Wide banner on the package page. Recommended 16:9 or 3:2, at least 1400px wide.
              </p>
              <div
                className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300"
                onClick={() => !headerUploading && headerInputRef.current?.click()}
              >
                {form.header_image_url ? (
                  <div className="relative aspect-[21/9] min-h-[120px] w-full">
                    <Image
                      src={form.header_image_url}
                      alt="Package header"
                      fill
                      className="object-cover"
                      unoptimized={remoteImage(form.header_image_url)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                      <span className="text-sm font-bold text-white">
                        {headerUploading ? "Uploading…" : "Click to replace"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="text-sm font-semibold text-slate-500">
                      {headerUploading ? "Uploading…" : "Click to upload header image"}
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={headerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadHeader(f);
                  e.target.value = "";
                }}
              />
              {form.header_image_url && (
                <button
                  type="button"
                  onClick={clearHeader}
                  disabled={headerUploading}
                  className="mt-3 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  Remove header image
                </button>
              )}
            </div>

            {/* Appearance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <Label>Accent color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.accent_color ?? "#2563eb"}
                      onChange={(e) => set("accent_color", e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded-lg border border-slate-200 p-1"
                    />
                    <Input value={form.accent_color ?? "#2563eb"} onChange={(v) => set("accent_color", v)} placeholder="#2563eb" />
                  </div>
                </div>
                <div>
                  <Label>Badge label</Label>
                  <Input value={form.badge_label ?? ""} onChange={(v) => set("badge_label", v || null)} placeholder="e.g. Most Popular" />
                </div>
                <div>
                  <Label>Badge color</Label>
                  <select
                    value={form.badge_color ?? "blue"}
                    onChange={(e) => set("badge_color", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                  >
                    {["blue", "green", "violet", "orange"].map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input type="number" value={form.sort_order ?? 0} onChange={(v) => set("sort_order", Number(v))} />
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-red-400">Danger</h2>
              <button
                onClick={async () => {
                  if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
                  await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
                  router.push("/admin/services");
                }}
                className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Delete package
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
