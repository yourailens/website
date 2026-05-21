"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type {
  CharacterSheet,
  CharacterEthnicity,
  CharacterAgeGroup,
  CharacterGender,
  CharacterSkinTone,
  CharacterArchetype,
} from "@/data/character_sheets";
import {
  ALL_ETHNICITIES,
  ALL_AGE_GROUPS,
  ALL_GENDERS,
  ALL_SKIN_TONES,
  ALL_ARCHETYPES,
  ETHNICITY_LABELS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  SKIN_TONE_LABELS,
  ARCHETYPE_LABELS,
} from "@/data/character_sheets";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type FormState = {
  title: string;
  description: string;
  image_url: string;
  ethnicity: CharacterEthnicity;
  age_group: CharacterAgeGroup;
  gender: CharacterGender;
  skin_tone: CharacterSkinTone;
  archetype: CharacterArchetype;
  nationality: string;
  hair_color: string;
  eye_color: string;
  style_tags: string;
  aspect_ratio: "portrait" | "square" | "landscape";
  featured: boolean;
  published: boolean;
  sort_order: number;
};

const BLANK: FormState = {
  title: "", description: "", image_url: "",
  ethnicity: "other", age_group: "adult", gender: "female",
  skin_tone: "medium", archetype: "everyman",
  nationality: "", hair_color: "", eye_color: "",
  style_tags: "",
  aspect_ratio: "portrait",
  featured: false, published: false, sort_order: 0,
};

async function uploadFile(file: File, slug: string): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  const res = await fetch("/api/admin/character-sheets/upload-image", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json() as { url?: string };
  return json.url ?? null;
}

function Select<T extends string>({
  label, value, options, labels, onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
      >
        {options.map((o) => (
          <option key={o} value={o}>{labels[o]}</option>
        ))}
      </select>
    </div>
  );
}

export default function AdminCharacterSheetsManager() {
  const [sheets, setSheets] = useState<CharacterSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CharacterSheet | null>(null);
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
      const res = await fetch("/api/admin/character-sheets");
      const json = await res.json() as { character_sheets: CharacterSheet[] };
      setSheets(json.character_sheets ?? []);
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

  function startEdit(s: CharacterSheet) {
    setEditing(s);
    setForm({
      title:       s.title,
      description: s.description ?? "",
      image_url:   s.image_url,
      ethnicity:   s.ethnicity,
      age_group:   s.age_group,
      gender:      s.gender,
      skin_tone:   s.skin_tone,
      archetype:   s.archetype,
      nationality: s.nationality ?? "",
      hair_color:  s.hair_color  ?? "",
      eye_color:   s.eye_color   ?? "",
      style_tags:  s.style_tags.join(", "),
      aspect_ratio: s.aspect_ratio,
      featured:    s.featured,
      published:   s.published,
      sort_order:  s.sort_order,
    });
    setImageFile(null);
    setImagePreview(s.image_url);
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

      if (!imageUrl) { setMsg("Please upload a character sheet image."); setBusy(false); return; }

      const payload = {
        slug,
        title:        form.title,
        description:  form.description.trim() || null,
        image_url:    imageUrl,
        ethnicity:    form.ethnicity,
        age_group:    form.age_group,
        gender:       form.gender,
        skin_tone:    form.skin_tone,
        archetype:    form.archetype,
        nationality:  form.nationality.trim() || null,
        hair_color:   form.hair_color.trim()  || null,
        eye_color:    form.eye_color.trim()   || null,
        style_tags:   form.style_tags.split(",").map((t) => t.trim()).filter(Boolean),
        aspect_ratio: form.aspect_ratio,
        featured:     form.featured,
        published:    form.published,
        sort_order:   form.sort_order,
      };

      let res: Response;
      if (editing) {
        res = await fetch(`/api/admin/character-sheets/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/character-sheets", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "Unknown error");
      setMsg(editing ? "Updated!" : "Created!");
      await load();
      setIsCreating(false);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  async function doDelete(s: CharacterSheet) {
    if (!confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/character-sheets/${s.id}`, { method: "DELETE" });
    const json = await res.json() as { ok?: boolean; error?: string };
    if (json.ok) { setMsg("Deleted."); await load(); } else { setMsg(json.error ?? "Error"); }
  }

  async function togglePublish(s: CharacterSheet) {
    await fetch(`/api/admin/character-sheets/${s.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !s.published }),
    });
    await load();
  }

  // ── Form ──────────────────────────────────────────────────────

  if (isCreating) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin → Character Sheets</p>
              <h1 className="mt-0.5 font-heading text-xl font-black text-slate-900">
                {editing ? `Edit: ${editing.title}` : "New Character Sheet"}
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

            {/* Left column */}
            <div className="space-y-6">
              {/* Image upload */}
              <div>
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Character Sheet Image</p>
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
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                      <p className="text-sm font-semibold text-slate-500">Click to upload character sheet image</p>
                      <p className="mt-1 text-xs text-slate-400">PNG, JPG, WebP · Portrait recommended</p>
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
                <div className="mt-2 flex gap-2">
                  {(["portrait", "square", "landscape"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setField("aspect_ratio", a)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        form.aspect_ratio === a ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-500 hover:border-blue-200"
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
                  placeholder="e.g. Zara — South Asian Young Adult"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  placeholder="Brief description of the character…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Character attributes */}
              <div className="grid grid-cols-2 gap-4">
                <Select label="Ethnicity *" value={form.ethnicity} options={ALL_ETHNICITIES} labels={ETHNICITY_LABELS} onChange={(v) => setField("ethnicity", v)} />
                <Select label="Age Group *" value={form.age_group} options={ALL_AGE_GROUPS} labels={AGE_GROUP_LABELS} onChange={(v) => setField("age_group", v)} />
                <Select label="Gender *" value={form.gender} options={ALL_GENDERS} labels={GENDER_LABELS} onChange={(v) => setField("gender", v)} />
                <Select label="Skin Tone" value={form.skin_tone} options={ALL_SKIN_TONES} labels={SKIN_TONE_LABELS} onChange={(v) => setField("skin_tone", v)} />
                <Select label="Archetype" value={form.archetype} options={ALL_ARCHETYPES} labels={ARCHETYPE_LABELS} onChange={(v) => setField("archetype", v)} />
              </div>

              {/* Free-form descriptors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Nationality</label>
                  <input
                    value={form.nationality}
                    onChange={(e) => setField("nationality", e.target.value)}
                    placeholder="e.g. Indian"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Hair Color</label>
                  <input
                    value={form.hair_color}
                    onChange={(e) => setField("hair_color", e.target.value)}
                    placeholder="e.g. Black wavy"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Eye Color</label>
                  <input
                    value={form.eye_color}
                    onChange={(e) => setField("eye_color", e.target.value)}
                    placeholder="e.g. Deep brown"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Style tags */}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Style Tags <span className="normal-case text-slate-400">(comma-separated)</span></label>
                <input
                  value={form.style_tags}
                  onChange={(e) => setField("style_tags", e.target.value)}
                  placeholder="e.g. glam, editorial, traditional, minimal"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Publishing</p>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700">Published</span>
                    <div
                      onClick={() => setField("published", !form.published)}
                      className={`relative h-6 w-10 rounded-full transition-colors ${form.published ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${form.published ? "left-5" : "left-1"}`} />
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700">Featured</span>
                    <div
                      onClick={() => setField("featured", !form.featured)}
                      className={`relative h-6 w-10 rounded-full transition-colors ${form.featured ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${form.featured ? "left-5" : "left-1"}`} />
                    </div>
                  </label>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Sort Order</label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setField("sort_order", Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {msg && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                  msg.includes("!") ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? "Saving…" : editing ? "Save Changes" : "Create Sheet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin</p>
            <h1 className="mt-0.5 font-heading text-xl font-black text-slate-900">Character Sheets</h1>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
          >
            + New Sheet
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {msg && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{msg}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-heading text-lg font-bold text-slate-700">No character sheets yet</p>
            <p className="mt-1 text-sm text-slate-400">Add your first one using the button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sheets.map((s) => (
              <div key={s.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                  <Image
                    src={s.image_url}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  {!s.published && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Draft</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-bold text-slate-800">{s.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {ETHNICITY_LABELS[s.ethnicity]} · {AGE_GROUP_LABELS[s.age_group]}
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="flex-1 rounded-lg border border-slate-200 py-1 text-[10px] font-bold text-slate-600 hover:border-blue-200 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(s)}
                      className={`flex-1 rounded-lg py-1 text-[10px] font-bold transition ${
                        s.published ? "border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600" : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {s.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => doDelete(s)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-red-400 hover:border-red-200 hover:bg-red-50"
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
