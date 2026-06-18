"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ModuleGalleryEditor, {
  emptyGalleryItem,
  type ModuleGalleryItemDraft,
} from "@/components/admin/ModuleGalleryEditor";
import AvatarCropModal from "@/components/avatars/AvatarCropModal";
import type { StudioModuleType, StudioModuleWithItems, StudioModuleAspect } from "@/data/studio-modules";
import {
  ALL_STUDIO_MODULE_TYPES,
  STUDIO_MODULE_COVER_ASPECT,
  STUDIO_MODULE_TYPE_LABELS,
  studioModuleDetailPath,
} from "@/data/studio-modules";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function padSeries(n: number): string {
  return String(n).padStart(2, "0");
}

/** Next episode number for a module type (reads trailing digits from existing titles). */
function nextSeriesNumber(modules: StudioModuleWithItems[], type: StudioModuleType): number {
  let max = 0;
  for (const m of modules) {
    if (m.module_type !== type) continue;
    const match = m.title.match(/\s(\d{1,4})$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return max + 1;
}

function defaultModuleTitle(modules: StudioModuleWithItems[], type: StudioModuleType): string {
  return `${STUDIO_MODULE_TYPE_LABELS[type]} ${padSeries(nextSeriesNumber(modules, type))}`;
}

function firstGalleryImageUrl(items: ModuleGalleryItemDraft[]): string | null {
  for (const item of items) {
    if (item.media_type === "image" && item.image_url?.trim()) return item.image_url.trim();
  }
  return null;
}

function resolveCoverUrl(cover: string, items: ModuleGalleryItemDraft[]): string | null {
  if (cover.trim()) return cover.trim();
  return firstGalleryImageUrl(items);
}

function moduleListCover(mod: StudioModuleWithItems): string | null {
  return mod.cover_image_url?.trim() || firstGalleryImageUrl(itemsFromModule(mod)) || null;
}

type FormState = {
  title: string;
  description: string;
  module_type: StudioModuleType;
  cover_image_url: string;
  cover_aspect: StudioModuleAspect;
  featured: boolean;
  published: boolean;
  sort_order: number;
  items: ModuleGalleryItemDraft[];
};

const BLANK: FormState = {
  title: "",
  description: "",
  module_type: "prompt_playbooks",
  cover_image_url: "",
  cover_aspect: "portrait",
  featured: false,
  published: false,
  sort_order: 0,
  items: [],
};

function itemsFromModule(mod: StudioModuleWithItems): ModuleGalleryItemDraft[] {
  return mod.items.map((i) => ({
    media_type: i.media_type,
    image_url: i.image_url ?? "",
    video_url: i.video_url ?? "",
    poster_url: i.poster_url ?? "",
    aspect_ratio: i.aspect_ratio as StudioModuleAspect,
    caption: i.caption ?? "",
    prompt: i.prompt ?? "",
  }));
}

async function uploadCoverFile(file: File, slug: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  const res = await fetch("/api/admin/studio-modules/upload-media", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Cover upload failed");
  return ((await res.json()) as { url?: string }).url ?? "";
}

export default function AdminModulesManager() {
  const [modules, setModules] = useState<StudioModuleWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StudioModuleType | "all">("all");
  const [editing, setEditing] = useState<StudioModuleWithItems | null>(null);
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/studio-modules");
      const json = (await res.json()) as { modules?: StudioModuleWithItems[] };
      setModules(json.modules ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = modules.filter((m) => filter === "all" || m.module_type === filter);

  function sf<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const slug = editing?.slug ?? slugify(form.title);
      const coverUrl = resolveCoverUrl(form.cover_image_url, form.items);
      const payload = {
        slug,
        title: form.title,
        description: form.description.trim() || null,
        module_type: form.module_type,
        cover_image_url: coverUrl,
        cover_aspect: STUDIO_MODULE_COVER_ASPECT,
        featured: form.featured,
        published: form.published,
        sort_order: form.sort_order,
        items: form.items.map((item, i) => ({
          media_type: item.media_type,
          image_url: item.image_url || null,
          video_url: item.video_url || null,
          poster_url: item.poster_url || null,
          aspect_ratio: item.aspect_ratio,
          caption: item.caption.trim() || null,
          prompt: item.prompt.trim() || null,
          sort_order: i,
        })),
      };

      const res = await fetch(editing ? `/api/admin/studio-modules/${editing.id}` : "/api/admin/studio-modules", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "Error");
      setMsg(editing ? "Updated!" : "Created!");
      await load();
      setShowing(false);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function doDelete(item: StudioModuleWithItems) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await fetch(`/api/admin/studio-modules/${item.id}`, { method: "DELETE" });
    await load();
  }

  async function togglePublish(item: StudioModuleWithItems) {
    await fetch(`/api/admin/studio-modules/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    await load();
  }

  function openEdit(item: StudioModuleWithItems) {
    const items = itemsFromModule(item);
    const cover = item.cover_image_url?.trim() || firstGalleryImageUrl(items) || "";
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description ?? "",
      module_type: item.module_type,
      cover_image_url: cover,
      cover_aspect: STUDIO_MODULE_COVER_ASPECT,
      featured: item.featured,
      published: item.published,
      sort_order: item.sort_order,
      items,
    });
    setMsg("");
    setShowing(true);
  }

  function openNew(type?: StudioModuleType) {
    const moduleType = type ?? "prompt_playbooks";
    const series = nextSeriesNumber(modules, moduleType);
    setEditing(null);
    setForm({
      ...BLANK,
      module_type: moduleType,
      title: defaultModuleTitle(modules, moduleType),
      sort_order: series - 1,
      items: [],
    });
    setMsg("");
    setShowing(true);
  }

  function handleGalleryChange(items: ModuleGalleryItemDraft[]) {
    setForm((f) => {
      const firstImage = firstGalleryImageUrl(items);
      return {
        ...f,
        items,
        cover_image_url: f.cover_image_url.trim() || firstImage || "",
        cover_aspect: STUDIO_MODULE_COVER_ASPECT,
      };
    });
  }

  function handleTypeChange(type: StudioModuleType) {
    if (editing) {
      sf("module_type", type);
      return;
    }
    const series = nextSeriesNumber(modules, type);
    setForm((f) => ({
      ...f,
      module_type: type,
      title: defaultModuleTitle(modules, type),
      sort_order: series - 1,
    }));
  }

  if (showing) {
    return (
      <div className="min-h-screen bg-slate-50">
        {coverCropSrc ? (
          <AvatarCropModal
            imageSrc={coverCropSrc}
            title="Crop cover"
            lockAspect={3 / 4}
            onCancel={() => {
              if (coverCropSrc.startsWith("blob:")) URL.revokeObjectURL(coverCropSrc);
              setCoverCropSrc(null);
            }}
            onComplete={async (blob) => {
              setBusy(true);
              try {
                const slug = (editing?.slug ?? slugify(form.title)) || "module";
                const fd = new FormData();
                fd.append("file", blob, "cover.jpg");
                fd.append("slug", slug);
                const res = await fetch("/api/admin/studio-modules/upload-media", { method: "POST", body: fd });
                if (!res.ok) throw new Error("Upload failed");
                const url = ((await res.json()) as { url?: string }).url ?? "";
                sf("cover_image_url", url);
                URL.revokeObjectURL(coverCropSrc);
                setCoverCropSrc(null);
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
        ) : null}

        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
                Admin → Modules
              </p>
              <h1 className="font-heading text-xl font-black text-slate-900">
                {editing ? `Edit: ${editing.title}` : "New module"}
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
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => sf("title", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Type *
              </label>
              <select
                value={form.module_type}
                onChange={(e) => handleTypeChange(e.target.value as StudioModuleType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                {ALL_STUDIO_MODULE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {STUDIO_MODULE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => sf("description", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Cover image
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Uploads keep original ratio. Shown as 3:4 on listing cards. Crop optional — first gallery image used if empty.
            </p>
            <div className="flex flex-wrap items-start gap-4">
              <div
                className="relative max-w-xs min-w-[140px] flex-1 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300"
                onClick={() => coverRef.current?.click()}
              >
                {form.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.cover_image_url} alt="Cover" className="block max-h-64 w-full object-contain" />
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center text-sm font-semibold text-slate-500">
                    Click to upload cover
                  </div>
                )}
              </div>
              {form.cover_image_url ? (
                <button
                  type="button"
                  onClick={() => setCoverCropSrc(form.cover_image_url)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-blue-200"
                >
                  Crop cover (3:4)
                </button>
              ) : null}
            </div>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setBusy(true);
                try {
                  const slug = (editing?.slug ?? slugify(form.title)) || "module";
                  const url = await uploadCoverFile(f, slug);
                  sf("cover_image_url", url);
                } catch (ex) {
                  setMsg(ex instanceof Error ? ex.message : "Upload failed");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </div>

          <ModuleGalleryEditor
            items={form.items}
            onChange={handleGalleryChange}
            uploadSlug={(editing?.slug ?? slugify(form.title)) || "module"}
            showPromptField
          />

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Sort order</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => sf("sort_order", Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
              />
            </label>
            {(["published", "featured"] as const).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-3">
                <div
                  onClick={() => sf(k, !form[k])}
                  className={`relative h-6 w-10 rounded-full transition-colors ${form[k] ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${form[k] ? "left-5" : "left-1"}`}
                  />
                </div>
                <span className="text-sm font-semibold capitalize text-slate-700">{k}</span>
              </label>
            ))}
          </div>

          {msg ? (
            <p
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.includes("!") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {msg}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Create module"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin</p>
            <h1 className="font-heading text-xl font-black text-slate-900">Modules</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_STUDIO_MODULE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => openNew(t)}
                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
              >
                + {STUDIO_MODULE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-xs font-bold ${filter === "all" ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
          >
            All
          </button>
          {ALL_STUDIO_MODULE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${filter === t ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
            >
              {STUDIO_MODULE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-heading text-lg font-bold text-slate-700">No modules yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[3/4] bg-slate-100">
                  {moduleListCover(item) ? (
                    <Image src={moduleListCover(item)!} alt={item.title} fill className="object-cover" unoptimized />
                  ) : null}
                  {!item.published && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-xs font-bold text-white">Draft</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                    {STUDIO_MODULE_TYPE_LABELS[item.module_type]}
                  </p>
                  <p className="mt-1 truncate font-bold text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {item.items.length} items · order {item.sort_order}
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
                      href={studioModuleDetailPath(item.module_type, item.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => togglePublish(item)}
                      className={`rounded-lg px-3 py-1 text-[10px] font-bold ${item.published ? "border border-slate-200 text-slate-500" : "bg-blue-600 text-white"}`}
                    >
                      {item.published ? "Unpublish" : "Publish"}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
