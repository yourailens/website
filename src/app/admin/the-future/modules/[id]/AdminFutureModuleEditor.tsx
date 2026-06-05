"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import FutureInlineTimelineEditor from "@/components/admin/FutureInlineTimelineEditor";
import { FUTURE_COPY } from "@/data/the-future-copy";
import { emptyFrame, type FutureFrameDraft } from "@/components/admin/FutureSequenceFrameFields";
import type { FutureField, FutureModuleWithFrames } from "@/data/the-future";
import { slugifyFuture, uploadFutureCropBlob, uploadFutureMedia } from "@/lib/the-future/admin-media";

function framesToDrafts(frames: FutureModuleWithFrames["frames"]): FutureFrameDraft[] {
  return frames.length
    ? frames.map((f) => ({
        label: f.label,
        caption: f.caption ?? "",
        media_type: f.media_type,
        image_url: f.image_url ?? "",
        video_url: f.video_url ?? "",
        poster_url: f.poster_url ?? "",
        aspect_ratio: f.aspect_ratio,
      }))
    : [emptyFrame()];
}

const headlineInput =
  "w-full border-0 bg-transparent font-heading text-[clamp(1.75rem,4vw,2.65rem)] font-black leading-tight text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0";
const subInput =
  "mt-3 w-full border-0 border-b border-dashed border-slate-200 bg-transparent text-lg font-medium text-slate-600 placeholder:text-slate-300 focus:border-blue-400 focus:outline-none";
const introInput =
  "mt-4 w-full resize-y rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-base leading-relaxed text-slate-600 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function AdminFutureModuleEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [field, setField] = useState<FutureField | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [intro, setIntro] = useState("");
  const [published, setPublished] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [frames, setFrames] = useState<FutureFrameDraft[]>([emptyFrame()]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/the-future/modules/${id}`);
      const data = (await res.json()) as { module?: FutureModuleWithFrames & { field: FutureField } };
      const m = data.module;
      if (!m) return;
      setField(m.field);
      setTitle(m.title);
      setSlug(m.slug);
      setTagline(m.tagline ?? "");
      setIntro(m.intro ?? "");
      setPublished(m.published);
      setSortOrder(m.sort_order);
      setFrames(framesToDrafts(m.frames));
      setSlugTouched(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadSlug = slug || field?.slug || "the-future";
  const previewHref =
    field && slug.trim() ? `/the-future/${field.slug}/${slug.trim()}` : null;

  async function save() {
    if (!title.trim()) {
      setMsg("Title is required.");
      return;
    }
    const finalSlug = (slug.trim() || slugifyFuture(title)).toLowerCase();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/the-future/modules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: finalSlug,
          tagline: tagline.trim() || null,
          intro: intro.trim() || null,
          published,
          sort_order: sortOrder,
          frames: frames.map((f, i) => ({
            label: f.label.trim() || `Frame ${i + 1}`,
            caption: f.caption.trim() || null,
            media_type: f.media_type,
            image_url: f.media_type === "image" ? f.image_url.trim() || null : null,
            video_url: f.media_type === "video" ? f.video_url.trim() || null : null,
            poster_url: f.poster_url.trim() || null,
            aspect_ratio: f.aspect_ratio,
            sort_order: i,
          })),
        }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Save failed");
      setMsg("Saved — matches what visitors see on the public page.");
      setSlug(finalSlug);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/the-future/modules/${id}`, { method: "DELETE" });
    router.push(field ? `/admin/the-future/fields/${field.id}` : "/admin/the-future");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fc]">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="sticky top-0 z-40 border-b border-blue-100/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link
            href={field ? `/admin/the-future/fields/${field.id}` : "/admin/the-future"}
            className="text-xs font-bold text-slate-500 hover:text-blue-700"
          >
            ← Back
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>
            {previewHref ? (
              <Link
                href={previewHref}
                target="_blank"
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:border-blue-200"
              >
                Preview ↗
              </Link>
            ) : null}
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        {msg ? (
          <p
            className={`mx-auto max-w-3xl px-6 pb-3 text-center text-sm font-semibold ${msg.includes("Saved") ? "text-emerald-700" : "text-red-600"}`}
          >
            {msg}
          </p>
        ) : null}
      </div>

      {/* Mirrors public module page — inputs in place of static copy */}
      <article className="bg-[#f4f7fc]">
        <section className="border-b border-blue-100/80 bg-gradient-to-b from-white to-[#f4f7fc]">
          <div className="mx-auto w-[92%] max-w-3xl py-10 md:py-12">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-blue-600">
              {FUTURE_COPY.editingModule} · {field?.title ?? "Field"}
            </p>
            <p className="mt-2 font-mono text-[10px] text-slate-400">
              /{field?.slug}/{slug || "…"}
            </p>

            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugifyFuture(e.target.value));
              }}
              placeholder="Module title"
              className={`${headlineInput} mt-6`}
            />
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Tagline (optional)"
              className={subInput}
            />
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Intro paragraph above the moments"
              rows={3}
              className={introInput}
            />

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
              <label>
                URL slug
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  className="mt-1 block w-48 rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-sm text-slate-800"
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="mt-1 block w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
              </label>
            </div>
          </div>
        </section>

        <div className="mx-auto w-[92%] max-w-3xl py-12 pb-28 md:py-16">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
            {FUTURE_COPY.framesHeading} (scroll to edit each moment)
          </p>
          <div className="mt-8">
            <FutureInlineTimelineEditor
              frames={frames}
              onChange={setFrames}
              uploadSlug={uploadSlug}
              uploadBlob={uploadFutureCropBlob}
              uploadFile={uploadFutureMedia}
            />
          </div>
        </div>
      </article>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-100 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={remove} className="text-xs font-bold text-red-600 hover:text-red-800">
            Delete module
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/50 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save entire page"}
          </button>
        </div>
      </div>
    </div>
  );
}
