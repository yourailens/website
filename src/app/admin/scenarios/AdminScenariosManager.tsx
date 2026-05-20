"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Scenario, ScenarioType, ScenarioSetting, ScenarioMood, ScenarioCharacterCount } from "@/data/scenarios";
import { ALL_SCENARIO_TYPES, SCENARIO_TYPE_ACCENTS, SCENARIO_TYPE_LABELS, SCENARIO_SETTING_LABELS, SCENARIO_MOOD_LABELS } from "@/data/scenarios";

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

type F = { title: string; description: string; image_url: string; scenario_type: ScenarioType; setting: ScenarioSetting; mood: ScenarioMood; character_count: ScenarioCharacterCount; style_tags: string; aspect_ratio: "portrait"|"square"|"landscape"; featured: boolean; published: boolean; sort_order: number };
const BLANK: F = { title:"", description:"", image_url:"", scenario_type:"portrait", setting:"outdoor", mood:"peaceful", character_count:"solo", style_tags:"", aspect_ratio:"portrait", featured:false, published:false, sort_order:0 };

async function uploadFile(file: File, slug: string): Promise<string|null> {
  const fd = new FormData(); fd.append("file", file); fd.append("slug", slug);
  const res = await fetch("/api/admin/scenarios/upload-image", { method:"POST", body:fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json() as { url?: string };
  return json.url ?? null;
}

export default function AdminScenariosManager() {
  const [items, setItems] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Scenario|null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<F>(BLANK);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/admin/scenarios"); const j = await res.json() as {scenarios:Scenario[]}; setItems(j.scenarios??[]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  function sf<K extends keyof F>(k: K, v: F[K]) { setForm(f => ({...f, [k]:v})); }

  function startCreate() { setEditing(null); setForm(BLANK); setImageFile(null); setImagePreview(null); setMsg(""); setIsCreating(true); }
  function startEdit(o: Scenario) { setEditing(o); setForm({ title:o.title, description:o.description??"", image_url:o.image_url, scenario_type:o.scenario_type, setting:o.setting, mood:o.mood, character_count:o.character_count, style_tags:o.style_tags.join(", "), aspect_ratio:o.aspect_ratio, featured:o.featured, published:o.published, sort_order:o.sort_order }); setImageFile(null); setImagePreview(o.image_url); setMsg(""); setIsCreating(true); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const slug = editing?.slug ?? slugify(form.title);
      const image_url = imageFile ? await uploadFile(imageFile, slug) : (form.image_url || editing?.image_url || null);
      if (!image_url) { setMsg("Please upload an image."); setBusy(false); return; }
      const payload = { slug, title:form.title, description:form.description.trim()||null, image_url, scenario_type:form.scenario_type, setting:form.setting, mood:form.mood, character_count:form.character_count, style_tags:form.style_tags.split(",").map(t=>t.trim()).filter(Boolean), aspect_ratio:form.aspect_ratio, featured:form.featured, published:form.published, sort_order:form.sort_order };
      const res = editing ? await fetch(`/api/admin/scenarios/${editing.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}) : await fetch("/api/admin/scenarios",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j = await res.json() as {ok?:boolean;error?:string};
      if (!j.ok) throw new Error(j.error??"Unknown error");
      setMsg(editing?"Updated!":"Created!"); await load(); setIsCreating(false);
    } catch(err) { setMsg(err instanceof Error?err.message:"Error"); } finally { setBusy(false); }
  }

  async function doDelete(o: Scenario) {
    if (!confirm(`Delete "${o.title}"?`)) return;
    const r = await fetch(`/api/admin/scenarios/${o.id}`,{method:"DELETE"});
    const j = await r.json() as {ok?:boolean;error?:string};
    if (j.ok) { setMsg("Deleted."); await load(); } else setMsg(j.error??"Error");
  }
  async function togglePublish(o: Scenario) { await fetch(`/api/admin/scenarios/${o.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({published:!o.published})}); await load(); }

  if (isCreating) return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin → Scenarios</p><h1 className="mt-0.5 font-heading text-xl font-black text-slate-900">{editing?`Edit: ${editing.title}`:"New Scenario"}</h1></div>
          <button type="button" onClick={() => setIsCreating(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">← Back</button>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            {/* Image */}
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Image</p>
              <div className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-blue-300" onClick={() => imgRef.current?.click()}>
                {imagePreview ? (<div className="relative"><Image src={imagePreview} alt="Preview" width={600} height={form.aspect_ratio==="portrait"?800:400} className="w-full object-cover" unoptimized /><div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100"><p className="font-bold text-white">Click to change</p></div></div>)
                : (<div className="flex flex-col items-center justify-center py-14 text-center"><p className="text-sm font-semibold text-slate-500">Click to upload</p></div>)}
              </div>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f=e.target.files?.[0]; if(f){setImageFile(f);setImagePreview(URL.createObjectURL(f));} }} />
              <div className="mt-2 flex gap-2">
                {(["portrait","square","landscape"] as const).map(a => <button key={a} type="button" onClick={() => sf("aspect_ratio",a)} className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${form.aspect_ratio===a?"bg-blue-600 text-white":"border border-slate-200 bg-white text-slate-500 hover:border-blue-200"}`}>{a}</button>)}
              </div>
            </div>
            <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Title *</label><input required value={form.title} onChange={e=>sf("title",e.target.value)} placeholder="e.g. Dramatic Rooftop Duo Scene" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" /></div>
            <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label><textarea rows={3} value={form.description} onChange={e=>sf("description",e.target.value)} className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" /></div>
            <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Style Tags (comma-separated)</label><input value={form.style_tags} onChange={e=>sf("style_tags",e.target.value)} placeholder="e.g. moody, rain, night, cinematic" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" /></div>
          </div>
          <div className="space-y-4">
            <div><p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Scenario Type</p><div className="grid grid-cols-2 gap-1.5">{ALL_SCENARIO_TYPES.map(t => <button key={t} type="button" onClick={() => sf("scenario_type",t)} className={`rounded-xl px-2 py-2 text-xs font-bold transition ${form.scenario_type===t?SCENARIO_TYPE_ACCENTS[t]+" ring-2 ring-offset-1":"border border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{SCENARIO_TYPE_LABELS[t]}</button>)}</div></div>
            <div><p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Setting</p><div className="grid grid-cols-2 gap-1">{(["indoor","outdoor","fantasy","sci_fi","historical","urban","nature","studio"] as ScenarioSetting[]).map(s => <button key={s} type="button" onClick={() => sf("setting",s)} className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${form.setting===s?"bg-blue-600 text-white":"border border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>{SCENARIO_SETTING_LABELS[s]}</button>)}</div></div>
            <div><p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Mood</p><div className="grid grid-cols-2 gap-1">{(["happy","dramatic","mysterious","peaceful","intense","playful","romantic","melancholic"] as ScenarioMood[]).map(m => <button key={m} type="button" onClick={() => sf("mood",m)} className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${form.mood===m?"bg-blue-600 text-white":"border border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>{SCENARIO_MOOD_LABELS[m]}</button>)}</div></div>
            <div><p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Characters</p><div className="flex gap-2">{(["solo","duo","group"] as ScenarioCharacterCount[]).map(c => <button key={c} type="button" onClick={() => sf("character_count",c)} className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${form.character_count===c?"bg-blue-600 text-white":"border border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>{c}</button>)}</div></div>
            <div><label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Sort order</label><input type="number" value={form.sort_order} onChange={e=>sf("sort_order",Number(e.target.value))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" /></div>
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
              {(["featured","published"] as const).map(key => <label key={key} className="flex cursor-pointer items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-700 capitalize">{key}</span><div onClick={() => sf(key,!form[key])} className={`relative h-6 w-11 rounded-full transition-colors ${form[key]?"bg-blue-600":"bg-slate-200"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form[key]?"translate-x-5":"translate-x-0.5"}`}/></div></label>)}
            </div>
            {msg && <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.includes("error")||msg.includes("fail")?"bg-red-50 text-red-700":"bg-green-50 text-green-700"}`}>{msg}</p>}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60">{busy?<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>:null}{busy?"Saving…":editing?"Update":"Publish"}</button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Admin → Resources</p><h1 className="mt-0.5 font-heading text-2xl font-black text-slate-900">Reference Scenarios</h1></div>
          <button type="button" onClick={startCreate} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700">+ Upload Scenario</button>
        </div>
        {msg && <p className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${msg.includes("error")?"bg-red-50 text-red-700":"bg-green-50 text-green-700"}`}>{msg}</p>}
        {loading ? <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5">{Array.from({length:10}).map((_,i)=><div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200"/>)}</div>
        : items.length===0 ? <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center"><p className="font-heading text-lg font-bold text-slate-400">No scenarios yet</p></div>
        : <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5">
            {items.map(o => {
              const accent = SCENARIO_TYPE_ACCENTS[o.scenario_type];
              return <div key={o.id} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative overflow-hidden bg-slate-100"><Image src={o.image_url} alt={o.title} width={280} height={o.aspect_ratio==="portrait"?390:280} className="w-full object-cover" unoptimized />{!o.published&&<div className="absolute inset-0 flex items-center justify-center bg-black/50"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">Draft</span></div>}</div>
                <div className="p-3"><p className="truncate text-xs font-bold text-slate-900">{o.title}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>{SCENARIO_TYPE_LABELS[o.scenario_type]}</span>
                <div className="mt-2.5 flex gap-1.5">
                  <button type="button" onClick={() => startEdit(o)} className="flex-1 rounded-lg border border-slate-200 py-1.5 text-[11px] font-bold text-slate-600 hover:border-blue-200 hover:text-blue-600">Edit</button>
                  <button type="button" onClick={() => togglePublish(o)} className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition ${o.published?"border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500":"bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>{o.published?"Unpublish":"Publish"}</button>
                  <button type="button" onClick={() => doDelete(o)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:border-red-200 hover:text-red-500">✕</button>
                </div></div>
              </div>;
            })}
          </div>}
      </div>
    </div>
  );
}
