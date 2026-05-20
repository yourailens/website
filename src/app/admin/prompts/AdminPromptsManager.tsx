"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Prompt } from "@/data/prompts";
import { promptCategoryLabel, promptMediaAccent } from "@/data/prompts";
import AdminPromptEditor, { EMPTY_FORM, type EditorForm } from "./AdminPromptEditor";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminPromptsManager() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<EditorForm>({ ...EMPTY_FORM });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Auth ──
  useEffect(() => {
    fetch("/api/admin/session").then((r) => setSessionOk(r.ok));
  }, []);

  // ── Load ──
  const load = async () => {
    const res = await fetch("/api/admin/prompts");
    if (!res.ok) return;
    const json = await res.json() as { prompts: Prompt[] };
    setPrompts(json.prompts);
  };
  useEffect(() => { if (sessionOk) load(); }, [sessionOk]);

  // ── Open editor ──
  function startCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setMsg("");
    setIsCreating(true);
  }

  function startEdit(p: Prompt) {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? "",
      cover_image_url: p.cover_image_url ?? "",
      cover_aspect: p.cover_aspect ?? "landscape",
      demo_video_url: p.demo_video_url ?? "",
      og_image_url: p.og_image_url ?? "",
      media_type: p.media_type,
      image_category: p.image_category ?? "photorealistic",
      video_category: p.video_category ?? "cinematic",
      difficulty: p.difficulty,
      models: p.models,
      tags: p.tags.join(", "),
      prompt_body: p.body,
      featured: p.featured,
      published: p.published,
      sort_order: p.sort_order,
    });
    setMsg("");
    setIsCreating(true);
  }

  function cancelEdit() {
    setIsCreating(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setMsg("");
  }

  // ── Upload helpers ──
  async function uploadFile(file: File, endpoint: string, slug: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug);
    const res = await fetch(endpoint, { method: "POST", body: fd });
    const json = await res.json() as { url?: string; error?: string };
    if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
    return json.url;
  }

  // ── Submit (called from editor) ──
  async function onSubmit(coverFile: File | null, videoFile: File | null) {
    setBusy(true);
    setMsg("");
    try {
      const slug = form.slug || slugify(form.title);
      const [coverUrl, demoVideoUrl] = await Promise.all([
        coverFile ? uploadFile(coverFile, "/api/admin/prompts/upload-cover", slug) : Promise.resolve(form.cover_image_url || null),
        videoFile ? uploadFile(videoFile, "/api/admin/prompts/upload-video", slug) : Promise.resolve(form.demo_video_url || null),
      ]);

      const payload = {
        slug,
        title: form.title,
        excerpt: form.excerpt.trim() || null,
        cover_image_url: coverUrl,
        cover_aspect: form.cover_aspect,
        demo_video_url: demoVideoUrl,
        og_image_url: form.og_image_url.trim() || null,
        media_type: form.media_type,
        image_category: form.media_type === "image" ? form.image_category : null,
        video_category: form.media_type === "video" ? form.video_category : null,
        difficulty: form.difficulty,
        models: form.models,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        prompt_body: form.prompt_body,
        featured: form.featured,
        published: form.published,
        sort_order: form.sort_order,
      };

      if (editing) {
        const res = await fetch(`/api/admin/prompts/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json() as { ok?: boolean; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Update failed");
        setMsg("✓ Prompt updated.");
      } else {
        const res = await fetch("/api/admin/prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json() as { ok?: boolean; slug?: string; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Create failed");
        setMsg(`✓ Prompt created! /prompts/${json.slug ?? slug}`);
        // Switch to edit mode so Save works on subsequent saves
        await load();
        const fresh = await fetch("/api/admin/prompts").then((r) => r.json()) as { prompts: Prompt[] };
        const created = fresh.prompts.find((p) => p.slug === (json.slug ?? slug));
        if (created) { setEditing(created); }
      }
      await load();
    } catch (err) {
      setMsg(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  // ── Delete ──
  async function doDelete(id: string) {
    await fetch(`/api/admin/prompts/${id}`, { method: "DELETE" });
    await load();
    setDeleteConfirm(null);
    if (editing?.id === id) cancelEdit();
  }

  // ── Toggle publish ──
  async function togglePublish(p: Prompt) {
    await fetch(`/api/admin/prompts/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    await load();
  }

  // ── Guards ──
  if (sessionOk === null) return <div className="p-8 text-sm text-slate-500">Checking session…</div>;
  if (!sessionOk) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">Not authorised. <Link href="/admin/login" className="text-blue-600 underline">Log in</Link></p>
    </div>
  );

  // ── Editor view ──
  if (isCreating) {
    return (
      <AdminPromptEditor
        editing={editing}
        form={form}
        setForm={setForm}
        onSubmit={onSubmit}
        onCancel={cancelEdit}
        busy={busy}
        msg={msg}
      />
    );
  }

  // ── List view ──
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs text-slate-400 hover:text-blue-600">← Dashboard</Link>
            <h1 className="mt-1 font-heading text-3xl font-black text-slate-900">Prompt Library</h1>
            <p className="mt-1 text-sm text-slate-500">{prompts.length} prompt{prompts.length !== 1 ? "s" : ""} total</p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            + New prompt
          </button>
        </div>

        {/* List */}
        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-slate-300">
                <path d="M12 2L19 6V12C19 15.87 15.87 20.27 12 21C8.13 20.27 5 15.87 5 12V6L12 2Z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-700">No prompts yet</p>
            <p className="mt-2 text-sm text-slate-400">Click "New prompt" to create your first workflow.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((p) => {
              const accent = promptMediaAccent(p.media_type);
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    {/* Thumbnail */}
                    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-slate-100 ${
                      p.cover_aspect === "portrait" ? "h-16 w-11" : p.cover_aspect === "square" ? "h-14 w-14" : "h-14 w-24"
                    }`}>
                      {p.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                            <path d="M12 2L19 6V12C19 15.87 15.87 20.27 12 21C8.13 20.27 5 15.87 5 12V6L12 2Z" /><circle cx="12" cy="12" r="2" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${accent.bg} ${accent.text} ${accent.border}`}>
                          {p.media_type}
                        </span>
                        <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          {promptCategoryLabel(p)}
                        </span>
                        {p.featured && <span className="text-[10px] font-bold text-amber-500">✦</span>}
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {p.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-heading text-sm font-bold text-slate-900">{p.title}</p>
                      <p className="font-mono text-[11px] text-slate-400">/prompts/{p.slug}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePublish(p)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        p.published ? "border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {p.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    {p.published && (
                      <a href={`/prompts/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        View ↗
                      </a>
                    )}
                    {deleteConfirm === p.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-red-600">Delete?</span>
                        <button type="button" onClick={() => doDelete(p.id)} className="rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">Yes</button>
                        <button type="button" onClick={() => setDeleteConfirm(null)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">No</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteConfirm(p.id)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600">
                        Delete
                      </button>
                    )}
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
