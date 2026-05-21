"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MoodBoard, AestheticStyle, AestheticEra } from "@/data/mood_boards";
import { ALL_AESTHETIC_STYLES, ALL_AESTHETIC_ERAS, AESTHETIC_STYLE_LABELS, AESTHETIC_ERA_LABELS } from "@/data/mood_boards";

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
type F = { title: string; description: string; image_url: string; aesthetic: AestheticStyle; era: AestheticEra; color_palette: string; style_tags: string; aspect_ratio: "portrait"|"square"|"landscape"; featured: boolean; published: boolean; sort_order: number };
const BLANK: F = { title: "", description: "", image_url: "", aesthetic: "minimalist", era: "modern", color_palette: "", style_tags: "", aspect_ratio: "landscape", featured: false, published: false, sort_order: 0 };

async function uploadFile(file: File, slug: string) {
  const fd = new FormData(); fd.append("file", file); fd.append("slug", slug);
  return ((await (await fetch("/api/admin/mood-boards/upload-image", { method: "POST", body: fd })).json()) as { url?: string }).url ?? null;
}

export default function AdminMoodBoardsManager() {
  const [items, setItems] = useState<MoodBoard[]>([]); const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MoodBoard | null>(null); const [showing, setShowing] = useState(false);
  const [form, setForm] = useState<F>(BLANK); const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => { setLoading(true); try { setItems(((await (await fetch("/api/admin/mood-boards")).json()) as { mood_boards: MoodBoard[] }).mood_boards ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  function sf<K extends keyof F>(k: K, v: F[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const slug = editing?.slug ?? slugify(form.title);
      const imageUrl = imageFile ? await uploadFile(imageFile, slug) : (form.image_url || editing?.image_url || null);
      if (!imageUrl) { setMsg("Please upload an image."); setBusy(false); return; }
      const payload = { slug, title: form.title, description: form.description.trim() || null, image_url: imageUrl, aesthetic: form.aesthetic, era: form.era, color_palette: form.color_palette.split(",").map((c) => c.trim()).filter(Boolean), style_tags: form.style_tags.split(",").map((t) => t.trim()).filter(Boolean), aspect_ratio: form.aspect_ratio, featured: form.featured, published: form.published, sort_order: form.sort_order };
      const res = await fetch(editing ? `/api/admin/mood-boards/${editing.id}` : "/api/admin/mood-boards", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!((await res.json()) as { ok?: boolean }).ok) throw new Error("Error");
      setMsg(editing ? "Updated!" : "Created!"); await load(); setShowing(false);
    } catch (err) { setMsg(err instanceof Error ? err.message : "Error"); } finally { setBusy(false); }
  }

  if (showing) return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4"><div className="mx-auto flex max-w-4xl items-center justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin → Mood Boards</p><h1 className="font-heading text-xl font-black text-slate-900">{editing ? `Edit: ${editing.title}` : "New Board"}</h1></div><button type="button" onClick={() => setShowing(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">← Back</button></div></div>
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <div><p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Mood Board Image</p>
          <div className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300" onClick={() => imgRef.current?.click()}>
            {imagePreview ? <Image src={imagePreview} alt="Preview" width={600} height={340} className="w-full object-cover" unoptimized />
              : <div className="flex flex-col items-center justify-center py-14"><p className="text-sm font-semibold text-slate-500">Click to upload mood board image</p></div>}
          </div>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setImageFile(f); setImagePreview(URL.createObjectURL(f)); }} />
          <div className="mt-2 flex gap-2">{(["portrait","square","landscape"] as const).map((a) => <button key={a} type="button" onClick={() => sf("aspect_ratio", a)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${form.aspect_ratio === a ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-500"}`}>{a}</button>)}</div>
        </div>
        <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Title *</label><input required value={form.title} onChange={(e) => sf("title", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></div>
        <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label><textarea value={form.description} onChange={(e) => sf("description", e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Aesthetic *</label><select value={form.aesthetic} onChange={(e) => sf("aesthetic", e.target.value as AestheticStyle)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400">{ALL_AESTHETIC_STYLES.map((a) => <option key={a} value={a}>{AESTHETIC_STYLE_LABELS[a]}</option>)}</select></div>
          <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Era</label><select value={form.era} onChange={(e) => sf("era", e.target.value as AestheticEra)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400">{ALL_AESTHETIC_ERAS.map((e) => <option key={e} value={e}>{AESTHETIC_ERA_LABELS[e]}</option>)}</select></div>
        </div>
        <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Color Palette (comma-separated hex)</label><input value={form.color_palette} onChange={(e) => sf("color_palette", e.target.value)} placeholder="e.g. #2c1810, #8b4513, #d2691e" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></div>
        <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Style Tags (comma-separated)</label><input value={form.style_tags} onChange={(e) => sf("style_tags", e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></div>
        <div className="flex gap-6">{(["published","featured"] as const).map((k) => <label key={k} className="flex items-center gap-3 cursor-pointer"><div onClick={() => sf(k, !form[k])} className={`relative h-6 w-10 rounded-full transition-colors ${form[k] ? "bg-blue-600" : "bg-slate-200"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${form[k] ? "left-5" : "left-1"}`} /></div><span className="text-sm font-semibold text-slate-700 capitalize">{k}</span></label>)}</div>
        {msg && <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.includes("!") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Saving…" : editing ? "Save Changes" : "Create Board"}</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4"><div className="mx-auto flex max-w-6xl items-center justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin</p><h1 className="font-heading text-xl font-black text-slate-900">Mood Boards</h1></div><button type="button" onClick={() => { setEditing(null); setForm(BLANK); setImageFile(null); setImagePreview(null); setMsg(""); setShowing(true); }} className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700">+ New Board</button></div></div>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {loading ? <div className="flex justify-center py-20"><span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>
        : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-video overflow-hidden bg-slate-100"><Image src={item.image_url} alt={item.title} fill className="object-cover" unoptimized />{!item.published && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><span className="text-xs font-bold text-white">Draft</span></div>}</div>
                {item.color_palette.length > 0 && <div className="flex h-2">{item.color_palette.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}</div>}
                <div className="p-3"><p className="truncate text-xs font-bold text-slate-800">{item.title}</p><p className="mt-0.5 text-[10px] text-slate-400">{AESTHETIC_STYLE_LABELS[item.aesthetic]} · {AESTHETIC_ERA_LABELS[item.era]}</p>
                  <div className="mt-2.5 flex gap-2">
                    <button type="button" onClick={() => { setEditing(item); setForm({ title: item.title, description: item.description ?? "", image_url: item.image_url, aesthetic: item.aesthetic, era: item.era, color_palette: item.color_palette.join(", "), style_tags: item.style_tags.join(", "), aspect_ratio: item.aspect_ratio, featured: item.featured, published: item.published, sort_order: item.sort_order }); setImageFile(null); setImagePreview(item.image_url); setMsg(""); setShowing(true); }} className="flex-1 rounded-lg border border-slate-200 py-1 text-[10px] font-bold text-slate-600 hover:border-blue-200 hover:text-blue-700">Edit</button>
                    <button type="button" onClick={async () => { await fetch(`/api/admin/mood-boards/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !item.published }) }); await load(); }} className={`flex-1 rounded-lg py-1 text-[10px] font-bold ${item.published ? "border border-slate-200 text-slate-500" : "bg-blue-600 text-white"}`}>{item.published ? "Unpublish" : "Publish"}</button>
                    <button type="button" onClick={async () => { if (!confirm("Delete?")) return; await fetch(`/api/admin/mood-boards/${item.id}`, { method: "DELETE" }); await load(); }} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-red-400 hover:bg-red-50">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
