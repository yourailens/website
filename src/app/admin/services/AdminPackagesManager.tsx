"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ServiceInclude, ServiceWithGallery } from "@/data/services";
import {
  PRICING_CATEGORY_LABELS,
  formatPriceFull,
  serviceCardImage,
} from "@/data/services";
import ServiceGalleryEditor, {
  type ServiceGalleryDraft,
} from "@/components/admin/ServiceGalleryEditor";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type FormState = {
  name: string;
  slug: string;
  category_slug: string;
  tagline: string;
  description: string;
  price: number;
  traditional_value: number | null;
  unit: string;
  delivery_days: number;
  includes: ServiceInclude[];
  deliverables: string[];
  best_for: string[];
  faqs: { q: string; a: string }[];
  is_published: boolean;
  is_popular: boolean;
  is_featured: boolean;
  badge_label: string;
  badge_color: string;
  accent_color: string;
  sort_order: number;
  thumbnail_url: string;
  hero_media_type: "" | "image" | "video";
  hero_video_url: string;
  hero_image_url: string;
  hero_caption: string;
  hero_label: string;
  gallery: ServiceGalleryDraft[];
};

const BLANK: FormState = {
  name: "",
  slug: "",
  category_slug: "videos",
  tagline: "",
  description: "",
  price: 30000,
  traditional_value: null,
  unit: "per project",
  delivery_days: 7,
  includes: [],
  deliverables: [],
  best_for: [],
  faqs: [],
  is_published: false,
  is_popular: false,
  is_featured: false,
  badge_label: "",
  badge_color: "blue",
  accent_color: "#2563eb",
  sort_order: 0,
  thumbnail_url: "",
  hero_media_type: "",
  hero_video_url: "",
  hero_image_url: "",
  hero_caption: "",
  hero_label: "",
  gallery: [],
};

function formFromService(s: ServiceWithGallery): FormState {
  return {
    name: s.name,
    slug: s.slug,
    category_slug: s.category_slug,
    tagline: s.tagline ?? "",
    description: s.description ?? "",
    price: s.price,
    traditional_value: s.traditional_value,
    unit: s.unit,
    delivery_days: s.delivery_days,
    includes: s.includes ?? [],
    deliverables: s.deliverables ?? [],
    best_for: s.best_for ?? [],
    faqs: s.faqs ?? [],
    is_published: s.is_published,
    is_popular: s.is_popular,
    is_featured: s.is_featured,
    badge_label: s.badge_label ?? "",
    badge_color: s.badge_color ?? "blue",
    accent_color: s.accent_color ?? "#2563eb",
    sort_order: s.sort_order,
    thumbnail_url: s.thumbnail_url ?? "",
    hero_media_type: s.hero_media_type ?? "",
    hero_video_url: s.hero_video_url ?? "",
    hero_image_url: s.hero_image_url ?? "",
    hero_caption: s.hero_caption ?? "",
    hero_label: s.hero_label ?? "",
    gallery: (s.gallery ?? []).map((g) => ({
      media_type: g.media_type,
      image_url: g.image_url ?? "",
      video_url: g.video_url ?? "",
      poster_url: g.poster_url ?? "",
      caption: g.caption ?? "",
    })),
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </label>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => {
                const n = [...items];
                n[i] = e.target.value;
                onChange(n);
              }}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          + Add item
        </button>
      </div>
    </div>
  );
}

export default function AdminPackagesManager() {
  const [services, setServices] = useState<ServiceWithGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "videos" | "visuals">("all");
  const [editing, setEditing] = useState<ServiceWithGallery | null>(null);
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const heroVideoRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const json = (await res.json()) as { services?: ServiceWithGallery[] };
      setServices(json.services ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = services.filter((s) => filter === "all" || s.category_slug === filter);

  function sf<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openEdit(item: ServiceWithGallery) {
    setEditing(item);
    setForm(formFromService(item));
    setMsg("");
    setShowing(true);
  }

  function openNew(category: "videos" | "visuals" = "videos") {
    setEditing(null);
    setForm({
      ...BLANK,
      category_slug: category,
      name: category === "videos" ? "New AI Commercial" : "New Visuals Pack",
      slug: "",
      sort_order: services.length,
    });
    setMsg("");
    setShowing(true);
  }

  async function uploadMedia(file: File, kind: "video" | "image" | "thumbnail") {
    const slug = (editing?.slug || form.slug || slugify(form.name) || "package").trim();
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      const res = await fetch("/api/admin/services/upload-media", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      if (kind === "video") {
        sf("hero_video_url", json.url);
        sf("hero_media_type", "video");
      } else if (kind === "image") {
        sf("hero_image_url", json.url);
        if (!form.hero_video_url) sf("hero_media_type", "image");
      } else {
        sf("thumbnail_url", json.url);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const slug = (form.slug.trim() || slugify(form.name)).trim();
      if (!form.name.trim()) throw new Error("Name is required");
      if (!slug) throw new Error("Slug is required");

      const payload = {
        name: form.name.trim(),
        slug,
        category_slug: form.category_slug,
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        price: Number(form.price) || 0,
        traditional_value: form.traditional_value,
        unit: form.unit.trim() || "per project",
        delivery_days: Number(form.delivery_days) || 7,
        includes: form.includes.filter((x) => x.q.trim() || x.a.trim()),
        deliverables: form.deliverables.filter((x) => x.trim()),
        best_for: form.best_for.filter((x) => x.trim()),
        faqs: form.faqs.filter((f) => f.q.trim() || f.a.trim()),
        is_published: form.is_published,
        is_popular: form.is_popular,
        is_featured: form.is_featured,
        badge_label: form.badge_label.trim() || null,
        badge_color: form.badge_color || "blue",
        accent_color: form.accent_color || "#2563eb",
        sort_order: Number(form.sort_order) || 0,
        thumbnail_url: form.thumbnail_url.trim() || null,
        hero_media_type: form.hero_media_type || null,
        hero_video_url: form.hero_video_url.trim() || null,
        hero_image_url: form.hero_image_url.trim() || null,
        hero_caption: form.hero_caption.trim() || null,
        hero_label: form.hero_label.trim() || null,
        gallery: form.gallery.map((g, i) => ({
          media_type: g.media_type,
          image_url: g.image_url || null,
          video_url: g.video_url || null,
          poster_url: g.poster_url || null,
          caption: g.caption || null,
          sort_order: i,
        })),
      };

      const res = await fetch(
        editing ? `/api/admin/services/${editing.id}` : "/api/admin/services",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Save failed");
      setMsg(editing ? "Updated!" : "Created!");
      await load();
      setShowing(false);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function doDelete(item: ServiceWithGallery) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await fetch(`/api/admin/services/${item.id}`, { method: "DELETE" });
    await load();
  }

  async function togglePublish(item: ServiceWithGallery) {
    await fetch(`/api/admin/services/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !item.is_published }),
    });
    await load();
  }

  if (showing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
                Admin → Pricing
              </p>
              <h1 className="font-heading text-xl font-black text-slate-900">
                {editing ? `Edit: ${editing.name}` : "New package"}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setShowing(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              ← Back
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-8 px-6 py-8">
          {/* 1. Media first (matches public gallery-first page) */}
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
              1 · Hero media
            </p>
            <p className="mb-4 text-xs text-slate-500">
              Full width banner on the package page. Prefer a looping video. Keep labels short.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Hero type</FieldLabel>
                <select
                  value={form.hero_media_type}
                  onChange={(e) =>
                    sf("hero_media_type", e.target.value as FormState["hero_media_type"])
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Auto</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div>
                <FieldLabel>Hero label (short)</FieldLabel>
                <input
                  value={form.hero_label}
                  onChange={(e) => sf("hero_label", e.target.value)}
                  placeholder="Sample cut"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                {form.hero_video_url ? (
                  <video
                    src={form.hero_video_url}
                    className="mb-2 aspect-[21/9] w-full rounded-xl bg-black object-cover"
                    muted
                    controls
                  />
                ) : (
                  <div className="mb-2 flex aspect-[21/9] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                    No hero video
                  </div>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => heroVideoRef.current?.click()}
                  className="w-full rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700"
                >
                  {form.hero_video_url ? "Replace hero video" : "Upload hero video"}
                </button>
                <input
                  ref={heroVideoRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadMedia(f, "video");
                    e.target.value = "";
                  }}
                />
              </div>
              <div>
                {form.hero_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.hero_image_url}
                    alt=""
                    className="mb-2 aspect-[21/9] w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-2 flex aspect-[21/9] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                    No hero image / poster
                  </div>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => heroImageRef.current?.click()}
                  className="w-full rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700"
                >
                  {form.hero_image_url ? "Replace hero image" : "Upload hero image / poster"}
                </button>
                <input
                  ref={heroImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadMedia(f, "image");
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
              2 · Gallery
            </p>
            <p className="mb-4 text-xs text-slate-500">
              Main focus of the package page. Upload images and videos. Shown right under the hero.
            </p>
            <ServiceGalleryEditor
              items={form.gallery}
              onChange={(gallery) => sf("gallery", gallery)}
              uploadSlug={(editing?.slug || form.slug || slugify(form.name) || "package").trim()}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Listing card image
            </p>
            <p className="mb-3 text-xs text-slate-500">Used on /pricing cards only.</p>
            {form.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.thumbnail_url}
                alt=""
                className="mb-3 aspect-[16/10] max-w-sm rounded-xl object-cover"
              />
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => thumbRef.current?.click()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
            >
              {form.thumbnail_url ? "Replace thumbnail" : "Upload thumbnail"}
            </button>
            <input
              ref={thumbRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadMedia(f, "thumbnail");
                e.target.value = "";
              }}
            />
          </div>

          {/* 3. Basics */}
          <div>
            <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              3 · Package details
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <FieldLabel>Package name *</FieldLabel>
                <input
                  required
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: editing ? f.slug : slugify(name),
                    }));
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <FieldLabel>Slug *</FieldLabel>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => sf("slug", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <FieldLabel>Category *</FieldLabel>
                <select
                  value={form.category_slug}
                  onChange={(e) => sf("category_slug", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
                >
                  <option value="videos">Films & commercials</option>
                  <option value="visuals">Images & stills</option>
                </select>
              </div>
              <div>
                <FieldLabel>Tagline (short, shown on hero overlay)</FieldLabel>
                <input
                  value={form.tagline}
                  onChange={(e) => sf("tagline", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="mt-6">
              <FieldLabel>Description (below gallery)</FieldLabel>
              <textarea
                value={form.description}
                onChange={(e) => sf("description", e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <FieldLabel>Price (₹)</FieldLabel>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => sf("price", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <FieldLabel>Traditional value (₹)</FieldLabel>
                <input
                  type="number"
                  value={form.traditional_value ?? ""}
                  onChange={(e) =>
                    sf("traditional_value", e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <FieldLabel>Unit</FieldLabel>
                <input
                  value={form.unit}
                  onChange={(e) => sf("unit", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <FieldLabel>Delivery (days)</FieldLabel>
                <input
                  type="number"
                  value={form.delivery_days}
                  onChange={(e) => sf("delivery_days", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* 4. Scope Q&A below */}
          <div>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              4 · Package Q and A
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Shown below the gallery. Example: How many videos? → 3 videos each (40 to 45 seconds)
            </p>
            <div className="space-y-3">
              {form.includes.map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Scope {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => sf("includes", form.includes.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={item.q}
                    onChange={(e) => {
                      const n = [...form.includes];
                      n[i] = { ...n[i], q: e.target.value };
                      sf("includes", n);
                    }}
                    placeholder="How many videos?"
                    className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                  />
                  <textarea
                    value={item.a}
                    onChange={(e) => {
                      const n = [...form.includes];
                      n[i] = { ...n[i], a: e.target.value };
                      sf("includes", n);
                    }}
                    placeholder="3 videos each (40 to 45 seconds)"
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => sf("includes", [...form.includes, { q: "", a: "" }])}
                className="text-xs font-semibold text-blue-600"
              >
                + Add Q and A
              </button>
            </div>
          </div>

          <StringListEditor
            label="Deliverables"
            items={form.deliverables}
            onChange={(v) => sf("deliverables", v)}
          />
          <StringListEditor
            label="Best for"
            items={form.best_for}
            onChange={(v) => sf("best_for", v)}
          />

          <div>
            <FieldLabel>FAQs</FieldLabel>
            <div className="space-y-3">
              {form.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      FAQ {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => sf("faqs", form.faqs.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={faq.q}
                    onChange={(e) => {
                      const n = [...form.faqs];
                      n[i] = { ...n[i], q: e.target.value };
                      sf("faqs", n);
                    }}
                    placeholder="Question"
                    className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={faq.a}
                    onChange={(e) => {
                      const n = [...form.faqs];
                      n[i] = { ...n[i], a: e.target.value };
                      sf("faqs", n);
                    }}
                    placeholder="Answer"
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => sf("faqs", [...form.faqs, { q: "", a: "" }])}
                className="text-xs font-semibold text-blue-600"
              >
                + Add FAQ
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <FieldLabel>Badge label</FieldLabel>
              <input
                value={form.badge_label}
                onChange={(e) => sf("badge_label", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <FieldLabel>Badge color</FieldLabel>
              <select
                value={form.badge_color}
                onChange={(e) => sf("badge_color", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                {["blue", "green", "violet", "orange"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Accent color</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => sf("accent_color", e.target.value)}
                  className="h-11 w-12 rounded-lg border border-slate-200"
                />
                <input
                  value={form.accent_color}
                  onChange={(e) => sf("accent_color", e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <FieldLabel>Sort order</FieldLabel>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => sf("sort_order", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {(["is_published", "is_popular", "is_featured"] as const).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-3">
                <button
                  type="button"
                  onClick={() => sf(k, !form[k])}
                  className={`relative h-6 w-10 rounded-full transition-colors ${
                    form[k] ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                      form[k] ? "left-5" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-semibold capitalize text-slate-700">
                  {k.replace("is_", "")}
                </span>
              </label>
            ))}
          </div>

          {msg ? (
            <p
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                msg.includes("!") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {msg}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white disabled:opacity-60 sm:flex-none sm:px-10"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create package"}
            </button>
            {editing ? (
              <a
                href={`/pricing/${editing.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700"
              >
                Preview →
              </a>
            ) : null}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800"
            >
              ← Admin
            </Link>
            <h1 className="font-heading text-xl font-black text-slate-900">Pricing packages</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openNew("videos")}
              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
            >
              + Film package
            </button>
            <button
              type="button"
              onClick={() => openNew("visuals")}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
            >
              + Stills package
            </button>
            <a
              href="/pricing"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
            >
              Preview site →
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["videos", "Films"],
              ["visuals", "Stills"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                filter === id
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-heading text-lg font-bold text-slate-700">No packages yet</p>
            <button
              type="button"
              onClick={() => openNew("videos")}
              className="mt-4 text-sm font-semibold text-blue-600"
            >
              Create your first package →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const cover = serviceCardImage(item);
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div
                    className="relative aspect-[16/10] bg-slate-100"
                    style={{
                      background: `linear-gradient(135deg, ${item.accent_color ?? "#2563eb"}22, #f8fafc)`,
                    }}
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    {!item.is_published ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-xs font-bold text-white">Draft</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                      {PRICING_CATEGORY_LABELS[item.category_slug] ?? item.category_slug}
                    </p>
                    <p className="mt-1 truncate font-bold text-slate-800">{item.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {formatPriceFull(item.price)} · {item.gallery?.length ?? 0} gallery · order{" "}
                      {item.sort_order}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600"
                      >
                        Edit
                      </button>
                      <a
                        href={`/pricing/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => togglePublish(item)}
                        className={`rounded-lg px-3 py-1 text-[10px] font-bold ${
                          item.is_published
                            ? "border border-slate-200 text-slate-500"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {item.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => doDelete(item)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-[10px] font-bold text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
