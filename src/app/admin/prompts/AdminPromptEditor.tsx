"use client";

import { useEffect, useRef, useState } from "react";
import type {
  PromptMediaType,
  PromptImageCategory,
  PromptVideoCategory,
  PromptDifficulty,
  Prompt,
} from "@/data/prompts";
import BlockEditor from "@/components/admin/BlockEditor";
import {
  IMAGE_CATEGORY_LABELS,
  VIDEO_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  IMAGE_CATEGORIES,
  VIDEO_CATEGORIES,
  DIFFICULTIES,
  PROMPT_AI_MODELS,
  promptMediaAccent,
  difficultyAccent,
} from "@/data/prompts";

// Re-use the same markdown renderer from the public page
function renderInline(text: string): React.ReactNode[] {
  const segments: { type: "text" | "bold" | "code"; val: string }[] = [];
  let last = 0;
  const rx = /\*\*(.*?)\*\*|`([^`]+)`/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: "text", val: text.slice(last, m.index) });
    if (m[1] !== undefined) segments.push({ type: "bold", val: m[1] });
    else if (m[2] !== undefined) segments.push({ type: "code", val: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ type: "text", val: text.slice(last) });
  return segments.map((s, i) => {
    if (s.type === "bold") return <strong key={i} className="font-bold text-slate-900">{s.val}</strong>;
    if (s.type === "code") return (
      <code key={i} className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[0.82em] text-blue-700">{s.val}</code>
    );
    return s.val;
  });
}

function BodyPreview({ body }: { body: string }) {
  const lines = body.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const block: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) { block.push(lines[i]); i++; }
      nodes.push(
        <div key={`code-${i}`} className="my-4 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-[#0f172a]">
          {lang && <div className="border-b border-white/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">{lang}</div>}
          <pre className="max-w-full overflow-x-auto p-4 text-[12px] leading-relaxed text-slate-200"><code className="whitespace-pre">{block.join("\n")}</code></pre>
        </div>
      );
      i++; continue;
    }
    if (line.startsWith("# ")) { nodes.push(<h1 key={`h1-${i}`} className="mt-8 mb-3 font-heading text-2xl font-black tracking-tight text-slate-900 first:mt-0">{renderInline(line.slice(2))}</h1>); i++; continue; }
    if (line.startsWith("## ")) { nodes.push(<h2 key={`h2-${i}`} className="mt-6 mb-2 flex items-center gap-2 font-heading text-lg font-black text-slate-900"><span className="h-1 w-5 rounded-full bg-blue-500 shrink-0" />{renderInline(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith("### ")) { nodes.push(<h3 key={`h3-${i}`} className="mt-5 mb-1.5 font-heading text-base font-bold text-slate-800">{renderInline(line.slice(4))}</h3>); i++; continue; }
    if (line.startsWith("> ")) {
      const bqLines: string[] = [line.slice(2)]; i++;
      while (i < lines.length && lines[i].startsWith("> ")) { bqLines.push(lines[i].slice(2)); i++; }
      nodes.push(<blockquote key={`bq-${i}`} className="my-4 border-l-4 border-blue-500 bg-blue-50/60 px-4 py-3 text-sm leading-relaxed text-slate-700 italic rounded-r-xl">{bqLines.map((l, li) => <p key={li}>{renderInline(l)}</p>)}</blockquote>); continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { items.push(lines[i].slice(2)); i++; }
      nodes.push(<ul key={`ul-${i}`} className="my-3 space-y-1.5">{items.map((item, li) => <li key={li} className="flex gap-2.5 text-sm leading-relaxed text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" /><span>{renderInline(item)}</span></li>)}</ul>); continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      nodes.push(<ol key={`ol-${i}`} className="my-3 space-y-1.5">{items.map((item, li) => <li key={li} className="flex gap-2.5 text-sm leading-relaxed text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{li + 1}</span><span>{renderInline(item)}</span></li>)}</ol>); continue;
    }
    if (line.trim() === "---") { nodes.push(<hr key={`hr-${i}`} className="my-6 border-slate-200" />); i++; continue; }
    if (line.trim() === "") { i++; continue; }
    nodes.push(<p key={`p-${i}`} className="mb-3 text-sm leading-[1.8] text-slate-700">{renderInline(line)}</p>); i++;
  }
  return <div className="min-w-0 break-words">{nodes}</div>;
}

// ── Types ─────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export const EMPTY_FORM = {
  slug: "",
  title: "",
  excerpt: "",
  cover_image_url: "",
  cover_aspect: "landscape" as "square" | "portrait" | "landscape",
  demo_video_url: "",
  og_image_url: "",
  media_type: "image" as PromptMediaType,
  image_category: "photorealistic" as PromptImageCategory,
  video_category: "cinematic" as PromptVideoCategory,
  difficulty: "intermediate" as PromptDifficulty,
  models: [] as string[],
  tags: "",
  prompt_body: "",
  featured: false,
  published: false,
  sort_order: 0,
};

export type EditorForm = typeof EMPTY_FORM;

// ── Small helper components ───────────────────────────────────

function EditLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-blue-400 select-none">
      {children}
    </p>
  );
}

function EditZone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group/edit relative rounded-xl border border-dashed border-transparent transition-all hover:border-blue-300 hover:bg-blue-50/30 ${className}`}>
      {children}
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────

export default function AdminPromptEditor({
  editing,
  form,
  setForm,
  onSubmit,
  onCancel,
  busy,
  msg,
}: {
  editing: Prompt | null;
  form: EditorForm;
  setForm: React.Dispatch<React.SetStateAction<EditorForm>>;
  onSubmit: (coverFile: File | null, videoFile: File | null) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
  msg: string;
}) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [, setBodyTab] = useState<"write" | "preview">("write");
  const [customModel, setCustomModel] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!coverFile) { setCoverPreview(null); return; }
    const u = URL.createObjectURL(coverFile);
    setCoverPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [coverFile]);

  useEffect(() => {
    if (!videoFile) { setVideoPreview(null); return; }
    const u = URL.createObjectURL(videoFile);
    setVideoPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [videoFile]);

  // Reset file previews when switching between create/edit
  useEffect(() => {
    setCoverFile(null);
    setVideoFile(null);
  }, [editing?.id]);

  const accent = promptMediaAccent(form.media_type);
  const diff = difficultyAccent(form.difficulty);
  const coverSrc = coverPreview || form.cover_image_url || null;
  const videoSrc = videoPreview || form.demo_video_url || null;

  function setField<K extends keyof EditorForm>(k: K, v: EditorForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onTitleChange(v: string) {
    const autoSlug = !editing && !form.slug ? slugify(v) : form.slug;
    setForm((f) => ({ ...f, title: v, slug: autoSlug }));
  }

  function toggleModel(m: string) {
    setForm((f) => ({
      ...f,
      models: f.models.includes(m) ? f.models.filter((x) => x !== m) : [...f.models, m],
    }));
  }

  const tagsArray = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── Top action bar ── */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onCancel} className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 4L6 8l4 4" /></svg>
              All prompts
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-700">
              {editing ? "Editing" : "New prompt"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Published toggle */}
            <button
              type="button"
              onClick={() => setField("published", !form.published)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                form.published
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${form.published ? "bg-emerald-500" : "bg-slate-300"}`} />
              {form.published ? "Published" : "Draft"}
            </button>

            {/* Featured toggle */}
            <button
              type="button"
              onClick={() => setField("featured", !form.featured)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                form.featured
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-500 hover:border-amber-200"
              }`}
            >
              {form.featured ? "✦ Featured" : "✦ Feature"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onSubmit(coverFile, videoFile)}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Publish prompt"}
            </button>
          </div>
        </div>

        {msg && (
          <div className={`border-t px-6 py-2 text-xs font-semibold ${msg.startsWith("Error") ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
            {msg}
          </div>
        )}
      </div>

      {/* ── Cover ── */}
      <div
        className={`relative w-full cursor-pointer overflow-hidden bg-slate-100 transition hover:brightness-95 ${
          form.cover_aspect === "portrait" ? "flex justify-center bg-[#0a0a0f] py-8"
          : form.cover_aspect === "square" ? "flex justify-center bg-[#0a0a0f] py-8"
          : coverSrc ? "h-[38vh]" : "h-24"
        }`}
        onClick={() => coverInputRef.current?.click()}
        title="Click to change cover image"
      >
        {coverSrc ? (
          form.cover_aspect === "portrait" || form.cover_aspect === "square" ? (
            <div className={`relative overflow-hidden rounded-2xl shadow-2xl ${
              form.cover_aspect === "portrait" ? "h-[50vh] w-[min(300px,75vw)]" : "h-[min(50vh,420px)] w-[min(50vh,420px)]"
            }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverSrc} alt="Cover" className="h-full w-full object-cover" />
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverSrc} alt="Cover" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />
            </>
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center gap-3 text-slate-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            <span className="text-sm font-semibold">Click to upload cover image</span>
          </div>
        )}

        {/* Edit overlay */}
        <div className="absolute right-4 top-4 flex gap-2">
          <span className="rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {coverSrc ? "Change cover" : "Upload cover"}
          </span>
        </div>

        {/* Aspect pills */}
        <div className="absolute bottom-4 left-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {(["landscape", "portrait", "square"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setField("cover_aspect", a)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm transition ${
                form.cover_aspect === a
                  ? "border-blue-400 bg-blue-600/80 text-white"
                  : "border-white/30 bg-black/40 text-white/70 hover:bg-black/60"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />

      {/* ── Main two-column layout ── */}
      <div className="mx-auto max-w-7xl overflow-hidden px-6 pb-24 lg:px-10">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">

          {/* ── LEFT ── */}
          <div className="min-w-0">
            {/* Breadcrumb */}
            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-400">Prompts</span>
              <span>/</span>
              <span className="min-w-0 truncate text-slate-600">{form.title || "New prompt"}</span>
            </div>

            {/* Badges row — click to change */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {/* Media type */}
              <select
                value={form.media_type}
                onChange={(e) => {
                  const t = e.target.value as PromptMediaType;
                  setForm((f) => ({ ...f, media_type: t }));
                }}
                className={`cursor-pointer rounded-full border py-1 pl-3 pr-6 text-xs font-bold uppercase tracking-wider appearance-none outline-none transition ${accent.bg} ${accent.text} ${accent.border}`}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>

              {/* Category */}
              {form.media_type === "image" ? (
                <select
                  value={form.image_category}
                  onChange={(e) => setField("image_category", e.target.value as PromptImageCategory)}
                  className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-6 text-xs font-semibold uppercase tracking-wider text-slate-600 appearance-none outline-none"
                >
                  {IMAGE_CATEGORIES.map((c) => <option key={c} value={c}>{IMAGE_CATEGORY_LABELS[c]}</option>)}
                </select>
              ) : (
                <select
                  value={form.video_category}
                  onChange={(e) => setField("video_category", e.target.value as PromptVideoCategory)}
                  className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-6 text-xs font-semibold uppercase tracking-wider text-slate-600 appearance-none outline-none"
                >
                  {VIDEO_CATEGORIES.map((c) => <option key={c} value={c}>{VIDEO_CATEGORY_LABELS[c]}</option>)}
                </select>
              )}

              {/* Difficulty */}
              <select
                value={form.difficulty}
                onChange={(e) => setField("difficulty", e.target.value as PromptDifficulty)}
                className={`cursor-pointer rounded-full border py-1 pl-3 pr-6 text-xs font-bold uppercase tracking-wider appearance-none outline-none transition ${diff.bg} ${diff.text}`}
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
              </select>
            </div>

            {/* Title */}
            <EditZone className="mt-4">
              <EditLabel>Title</EditLabel>
              <textarea
                value={form.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Workflow title…"
                rows={2}
                className="w-full resize-none bg-transparent font-heading font-black leading-[1.05] tracking-tight text-slate-900 placeholder:text-slate-300 outline-none break-words"
                style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)", letterSpacing: "-0.025em" }}
              />
            </EditZone>

            {/* Excerpt */}
            <EditZone className="mt-3">
              <EditLabel>Excerpt (subtitle)</EditLabel>
              <textarea
                value={form.excerpt}
                onChange={(e) => setField("excerpt", e.target.value)}
                placeholder="One line that describes this workflow…"
                rows={2}
                className="w-full resize-none bg-transparent text-lg leading-relaxed text-slate-500 placeholder:text-slate-300 outline-none"
              />
            </EditZone>

            {/* Slug */}
            <div className="mt-2 flex items-center gap-2 border-b border-slate-100 pb-4">
              <span className="shrink-0 font-mono text-xs text-slate-400">yourailens.studio/prompts/</span>
              <input
                value={form.slug}
                onChange={(e) => setField("slug", slugify(e.target.value))}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs text-blue-600 outline-none placeholder:text-slate-300"
                placeholder="auto-slug"
              />
            </div>

            {/* Demo video zone */}
            <div className="mt-6">
              <div
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 text-center transition hover:border-blue-300 hover:bg-blue-50/30"
                onClick={() => videoInputRef.current?.click()}
              >
                {videoSrc ? (
                  <video src={videoSrc} controls playsInline muted preload="metadata" className="w-full rounded-xl bg-black max-h-64" onClick={(e) => e.stopPropagation()} />
                ) : (
                  <div className="flex items-center justify-center gap-3 py-6 text-slate-400">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    <span className="text-sm font-semibold">Click to upload demo video (optional)</span>
                  </div>
                )}
                {videoSrc && (
                  <p className="mt-2 text-[11px] font-semibold text-slate-400">Click to replace video</p>
                )}
              </div>
              {/* Or paste URL */}
              <div className="mt-2 flex items-center gap-2">
                <span className="shrink-0 text-xs text-slate-400">or paste URL:</span>
                <input
                  type="url"
                  value={form.demo_video_url}
                  onChange={(e) => setField("demo_video_url", e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  placeholder="https://…"
                />
              </div>
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />

            {/* ── Body editor ── */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Workflow body</p>
                  <p className="mt-0.5 text-xs text-slate-400">Each section is its own block — click + to add, hover a block to move or delete</p>
                </div>
                <span className="text-[10px] text-slate-300">{form.prompt_body.length} chars</span>
              </div>
              <BlockEditor
                key={editing?.id ?? "new"}
                value={form.prompt_body}
                onChange={(md) => setField("prompt_body", md)}
              />
            </div>

            {/* Tags display */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <EditLabel>Tags (comma-separated)</EditLabel>
              <input
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
                placeholder="portrait, neon, midjourney, natural lighting, …"
              />
              {tagsArray.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagsArray.map((tag) => (
                    <span key={tag} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="mt-8 lg:mt-0">
            <div className="space-y-5 lg:sticky lg:top-20">

              {/* AI Models */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">AI Models</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_AI_MODELS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleModel(m)}
                      className={`rounded-xl border px-3 py-1 text-[11px] font-semibold transition ${
                        form.models.includes(m)
                          ? "border-blue-400 bg-blue-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <input
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  placeholder="Custom model…"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const v = customModel.trim();
                      if (v) { toggleModel(v); setCustomModel(""); }
                    }
                  }}
                />
              </div>

              {/* Slug + sort */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">URL & order</p>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Slug</span>
                  <input
                    value={form.slug}
                    onChange={(e) => setField("slug", slugify(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-blue-700 outline-none focus:border-blue-400"
                    placeholder="auto-slug"
                  />
                </label>
                <label className="mt-3 flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-500">Sort order</span>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setField("sort_order", parseInt(e.target.value) || 0)}
                    className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                  />
                </label>
              </div>

              {/* Preview link */}
              {editing?.published && (
                <a
                  href={`/prompts/${editing.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
                >
                  View live ↗
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
