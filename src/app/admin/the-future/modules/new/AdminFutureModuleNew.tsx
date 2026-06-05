"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FutureInlineTimelineEditor from "@/components/admin/FutureInlineTimelineEditor";
import { FUTURE_COPY } from "@/data/the-future-copy";
import { emptyFrame, type FutureFrameDraft } from "@/components/admin/FutureSequenceFrameFields";
import type { FutureField } from "@/data/the-future";
import { slugifyFuture, uploadFutureCropBlob, uploadFutureMedia } from "@/lib/the-future/admin-media";

const headlineInput =
  "w-full border-0 bg-transparent font-heading text-[clamp(1.75rem,4vw,2.65rem)] font-black leading-tight text-slate-900 placeholder:text-slate-300 focus:outline-none";
const subInput =
  "mt-3 w-full border-0 border-b border-dashed border-slate-200 bg-transparent text-lg font-medium text-slate-600 placeholder:text-slate-300 focus:border-blue-400 focus:outline-none";
const introInput =
  "mt-4 w-full resize-y rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-base leading-relaxed text-slate-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function AdminFutureModuleNew() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fieldId = searchParams.get("field_id");

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
  const [frames, setFrames] = useState<FutureFrameDraft[]>([emptyFrame()]);

  useEffect(() => {
    if (!fieldId) {
      setLoading(false);
      return;
    }
    (async () => {
      const res = await fetch(`/api/admin/the-future/fields/${fieldId}`);
      const data = (await res.json()) as { field?: FutureField };
      setField(data.field ?? null);
      setLoading(false);
    })();
  }, [fieldId]);

  const uploadSlug = slug || field?.slug || "the-future";

  async function save() {
    if (!fieldId || !field) {
      setMsg("Missing field. Go back and open from a field.");
      return;
    }
    if (!title.trim()) {
      setMsg("Title is required.");
      return;
    }
    const finalSlug = (slug.trim() || slugifyFuture(title)).toLowerCase();
    setSaving(true);
    setMsg("");
    try {
      const createRes = await fetch("/api/admin/the-future", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "module",
          field_id: fieldId,
          slug: finalSlug,
          title: title.trim(),
          published,
        }),
      });
      const created = (await createRes.json()) as { id?: string; error?: string };
      if (!createRes.ok || !created.id) throw new Error(created.error ?? "Create failed");

      const patchRes = await fetch(`/api/admin/the-future/modules/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: finalSlug,
          tagline: tagline.trim() || null,
          intro: intro.trim() || null,
          published,
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
      if (!patchRes.ok) throw new Error(((await patchRes.json()) as { error?: string }).error ?? "Save failed");

      router.push(`/admin/the-future/modules/${created.id}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fc]">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!fieldId || !field) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">Pick a field first.</p>
        <Link href="/admin/the-future" className="mt-4 inline-block font-bold text-blue-600">
          ← The Future admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="sticky top-0 z-40 border-b border-blue-100/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-3">
          <Link href={`/admin/the-future/fields/${field.id}`} className="text-xs font-bold text-slate-500 hover:text-blue-700">
            ← {field.title}
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create & save"}
          </button>
        </div>
        {msg ? <p className="pb-3 text-center text-sm font-semibold text-red-600">{msg}</p> : null}
      </div>

      <article>
        <section className="border-b border-blue-100/80 bg-gradient-to-b from-white to-[#f4f7fc]">
          <div className="mx-auto w-[92%] max-w-3xl py-10 md:py-12">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-blue-600">
              {FUTURE_COPY.newModule} · {field.title}
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
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Tagline" className={subInput} />
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Intro"
              rows={3}
              className={introInput}
            />
            <label className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-600">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Publish when ready
            </label>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="slug"
              className="mt-4 block w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            />
          </div>
        </section>

        <div className="mx-auto w-[92%] max-w-3xl py-12 pb-28">
          <FutureInlineTimelineEditor
            frames={frames}
            onChange={setFrames}
            uploadSlug={uploadSlug}
            uploadBlob={uploadFutureCropBlob}
            uploadFile={uploadFutureMedia}
          />
        </div>
      </article>
    </div>
  );
}
