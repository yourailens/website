"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Outfit, OutfitCategory, OutfitCharacterType } from "@/data/outfits";
import {
  ALL_OUTFIT_CATEGORIES,
  OUTFIT_CATEGORY_ACCENTS,
  OUTFIT_CATEGORY_LABELS,
  OUTFIT_CHARACTER_LABELS,
} from "@/data/outfits";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type FormState = {
  title: string;
  description: string;
  image_url: string;
  category: OutfitCategory;
  character_type: OutfitCharacterType;
  style_tags: string;
  color_palette: string;
  aspect_ratio: "portrait" | "square" | "landscape";
  featured: boolean;
  published: boolean;
  sort_order: number;
};

const BLANK: FormState = {
  title: "", description: "", image_url: "",
  category: "casual", character_type: "female",
  style_tags: "", color_palette: "",
  aspect_ratio: "portrait",
  featured: false, published: false, sort_order: 0,
};

async function uploadFile(file: File, slug: string): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  const res = await fetch("/api/admin/outfits/upload-image", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json() as { url?: string };
  return json.url ?? null;
}

export default function AdminOutfitsManager() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Outfit | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/outfits");
      const json = await res.json() as { outfits: Outfit[] };
      setOutfits(json.outfits ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function startCreate() {
    setEditing(null);
    setForm(BLANK);
    setImageFile(null);
    setImagePreview(null);
    setMsg("");
    setIsCreating(true);
  }

  function startEdit(o: Outfit) {
    setEditing(o);
    setForm({
      title:          o.title,
      description:    o.description ?? "",
      image_url:      o.image_url,
      category:       o.category,
      character_type: o.character_type,
      style_tags:     o.style_tags.join(", "),
      color_palette:  o.color_palette.join(", "),
      aspect_ratio:   o.aspect_ratio,
      featured:       o.featured,
      published:      o.published,
      sort_order:     o.sort_order,
    });
    setImageFile(null);
    setImagePreview(o.image_url);
    setMsg("");
    setIsCreating(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const slug = editing?.slug ?? slugify(form.title);
      const imageUrl = imageFile
        ? await uploadFile(imageFile, slug)
        : (form.image_url || editing?.image_url || null);

      if (!imageUrl) { setMsg("Please upload an outfit image."); setBusy(false); return; }

      const payload = {
        slug,
        title:          form.title,
        description:    form.description.trim() || null,
        image_url:      imageUrl,
        category:       form.category,
        character_type: form.character_type,
        style_tags:     form.style_tags.split(",").map((t) => t.trim()).filter(Boolean),
        color_palette:  form.color_palette.split(",").map((c) => c.trim()).filter(Boolean),
        aspect_ratio:   form.aspect_ratio,
        featured:       form.featured,
        published:      form.published,
        sort_order:     form.sort_order,
      };

      let res: Response;
      if (editing) {
        res = await fetch(`/api/admin/outfits/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/outfits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "Unknown error");
      setMsg(editing ? "Outfit updated!" : "Outfit created!");
      await load();
      setIsCreating(false);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  async function doDelete(o: Outfit) {
    if (!confirm(`Delete "${o.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/outfits/${o.id}`, { method: "DELETE" });
    const json = await res.json() as { ok?: boolean; error?: string };
    if (json.ok) { setMsg("Deleted."); await load(); } else { setMsg(json.error ?? "Error"); }
  }

  async function togglePublish(o: Outfit) {
    await fetch(`/api/admin/outfits/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !o.published }),
    });
    await load();
  }

  // ── Form view ────────────────────────────────────────────────

  if (isCreating) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin → Outfits</p>
              <h1 className="mt-0.5 font-heading text-xl font-black text-slate-900">
                {editing ? `Edit: ${editing.title}` : "New Outfit"}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              ← Back to list
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mx-auto max-w-4xl px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

            {/* Main */}
            <div className="space-y-6">
              {/* Image upload */}
              <div>
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Outfit Image</p>
                <div
                  className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-blue-300 hover:bg-blue-50/40"
                  onClick={() => imageInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={600}
                        height={form.aspect_ratio === "portrait" ? 800 : form.aspect_ratio === "square" ? 600 : 340}
                        className="w-full object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                        <p className="font-bold text-white">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-slate-300">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                      </svg>
                      <p className="text-sm font-semibold text-slate-500">Click to upload outfit image</p>
                      <p className="mt-1 text-xs text-slate-400">PNG, JPG, WebP</p>
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }}
                />

                {/* Aspect pills */}
                <div className="mt-2 flex gap-2">
                  {(["portrait", "square", "landscape"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setField("aspect_ratio", a)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        form.aspect_ratio === a
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Celestial Fantasy Gown"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the outfit style, inspiration, or usage…"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Style tags */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Style Tags <span className="normal-case font-normal">(comma-separated)</span></label>
                <input
                  value={form.style_tags}
                  onChange={(e) => setField("style_tags", e.target.value)}
                  placeholder="e.g. flowy, ethereal, long-dress, pastel"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
                {form.style_tags && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.style_tags.split(",").filter((t) => t.trim()).map((t) => (
                      <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">#{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Color palette */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Color Palette <span className="normal-case font-normal">(hex codes, comma-separated)</span></label>
                <input
                  value={form.color_palette}
                  onChange={(e) => setField("color_palette", e.target.value)}
                  placeholder="e.g. #f0e6ff, #c4a4e0, #8b5cf6"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
                {form.color_palette && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.color_palette.split(",").filter((c) => c.trim()).map((c) => (
                      <span key={c} className="flex items-center gap-1.5">
                        <span className="h-6 w-6 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: c.trim() }} />
                        <span className="font-mono text-[11px] text-slate-500">{c.trim()}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Category *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_OUTFIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setField("category", cat)}
                      className={`rounded-xl px-2.5 py-2 text-xs font-bold transition ${
                        form.category === cat
                          ? OUTFIT_CATEGORY_ACCENTS[cat] + " ring-2 ring-offset-1"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {OUTFIT_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character type */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Character Type</label>
                <div className="flex gap-2">
                  {(["female", "male", "unisex"] as OutfitCharacterType[]).map((ct) => (
                    <button
                      key={ct}
                      type="button"
                      onClick={() => setField("character_type", ct)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                        form.character_type === ct
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                      }`}
                    >
                      {OUTFIT_CHARACTER_LABELS[ct]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort order */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Sort order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setField("sort_order", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
                {([["featured", "⭐ Featured"], ["published", "✅ Published"]] as const).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <div
                      onClick={() => setField(key, !form[key])}
                      className={`relative h-6 w-11 rounded-full transition-colors ${form[key] ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </label>
                ))}
              </div>

              {msg && (
                <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  msg.toLowerCase().includes("error") || msg.toLowerCase().includes("fail")
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}>{msg}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
                {busy ? "Saving…" : editing ? "Update Outfit" : "Publish Outfit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin → Resources</p>
            <h1 className="mt-0.5 font-heading text-2xl font-black text-slate-900">Outfit Reservoir</h1>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
          >
            + Upload Outfit
          </button>
        </div>

        {msg && (
          <p className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
            msg.toLowerCase().includes("error") || msg.toLowerCase().includes("delete") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}>{msg}</p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center">
            <p className="font-heading text-lg font-bold text-slate-400">No outfits yet</p>
            <p className="mt-1 text-sm text-slate-400">Click "Upload Outfit" to add the first one</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {outfits.map((o) => {
              const accent = OUTFIT_CATEGORY_ACCENTS[o.category];
              return (
                <div key={o.id} className="group mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative overflow-hidden bg-slate-100">
                    <Image
                      src={o.image_url}
                      alt={o.title}
                      width={320}
                      height={o.aspect_ratio === "portrait" ? 450 : o.aspect_ratio === "square" ? 320 : 200}
                      className="w-full object-cover"
                      unoptimized
                    />
                    {!o.published && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">Draft</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-bold text-slate-900">{o.title}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>
                      {OUTFIT_CATEGORY_LABELS[o.category]}
                    </span>
                    <div className="mt-2.5 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(o)}
                        className="flex-1 rounded-lg border border-slate-200 py-1.5 text-[11px] font-bold text-slate-600 hover:border-blue-200 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(o)}
                        className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition ${
                          o.published
                            ? "border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        {o.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => doDelete(o)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:border-red-200 hover:text-red-500"
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
