"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FutureMediaBlock from "@/components/the-future/FutureMediaBlock";
import FutureModuleListCard from "@/components/the-future/FutureModuleListCard";
import { FUTURE_COPY } from "@/data/the-future-copy";
import type { FutureField, FutureModuleListItem } from "@/data/the-future";
import { MODULE_COVER_ASPECTS } from "@/data/module-covers";
import { uploadFutureMedia } from "@/lib/the-future/admin-media";

export default function AdminFutureFieldEditor() {
  const { id } = useParams<{ id: string }>();
  const [modules, setModules] = useState<FutureModuleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverVideoUrl, setCoverVideoUrl] = useState("");
  const [coverMediaType, setCoverMediaType] = useState<"image" | "video">("image");
  const [coverAspect, setCoverAspect] = useState<(typeof MODULE_COVER_ASPECTS)[number]["id"]>("landscape");
  const [published, setPublished] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fieldRes, allRes] = await Promise.all([
        fetch(`/api/admin/the-future/fields/${id}`),
        fetch("/api/admin/the-future"),
      ]);
      const fieldData = (await fieldRes.json()) as { field?: FutureField };
      const allData = (await allRes.json()) as { fields: { id: string; modules: FutureModuleListItem[] }[] };
      const f = fieldData.field;
      if (f) {
        setTitle(f.title);
        setSlug(f.slug);
        setTagline(f.tagline ?? "");
        setDescription(f.description ?? "");
        setCoverImageUrl(f.cover_image_url ?? "");
        setCoverVideoUrl(f.cover_video_url ?? "");
        setCoverMediaType(f.cover_media_type);
        setCoverAspect(f.cover_aspect);
        setPublished(f.published);
        setSortOrder(f.sort_order);
      }
      setModules(allData.fields.find((x) => x.id === id)?.modules ?? []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/the-future/fields/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          cover_image_url: coverMediaType === "image" ? coverImageUrl.trim() || null : null,
          cover_video_url: coverMediaType === "video" ? coverVideoUrl.trim() || null : null,
          cover_media_type: coverMediaType,
          cover_aspect: coverAspect,
          published,
          sort_order: sortOrder,
        }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Save failed");
      setMsg("Field saved.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
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

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="sticky top-0 z-40 border-b border-blue-100/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link href="/admin/the-future" className="text-xs font-bold text-slate-500 hover:text-blue-700">
            ← All fields
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/the-future/${slug}`}
              target="_blank"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
            >
              Preview field ↗
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save field"}
            </button>
          </div>
        </div>
        {msg ? <p className="pb-2 text-center text-sm font-semibold text-emerald-700">{msg}</p> : null}
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-2xl border border-blue-100/80 bg-gradient-to-b from-white to-[#f8fbff] p-8 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">Field page</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-4 w-full border-0 bg-transparent font-heading text-4xl font-black text-slate-900 focus:outline-none"
            placeholder="Field title"
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-3 w-full border-0 border-b border-dashed border-slate-200 bg-transparent text-lg text-slate-600 focus:border-blue-400 focus:outline-none"
            placeholder="Tagline"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-600 focus:border-blue-300 focus:outline-none"
            placeholder="Description on the field collection page"
          />
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-slate-700">Cover upload</p>
              <input
                type="file"
                accept="image/*,video/*"
                className="mt-2 w-full text-xs"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  const { url, media_type } = await uploadFutureMedia(f, slug);
                  setCoverMediaType(media_type);
                  if (media_type === "image") {
                    setCoverImageUrl(url);
                    setCoverVideoUrl("");
                  } else {
                    setCoverVideoUrl(url);
                    setCoverImageUrl("");
                  }
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {MODULE_COVER_ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setCoverAspect(a.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      coverAspect === a.id ? "bg-blue-600 text-white" : "border border-slate-200"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <FutureMediaBlock
              mediaType={coverMediaType}
              imageUrl={coverImageUrl}
              videoUrl={coverVideoUrl}
              aspectRatio={coverAspect}
              alt={title}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>
            <label>
              Slug
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="ml-2 rounded-lg border border-slate-200 px-2 py-1 font-mono text-sm"
              />
            </label>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <h2 className="font-heading text-xl font-black text-slate-900">{FUTURE_COPY.exploreSection}</h2>
            <Link
              href={`/admin/the-future/modules/new?field_id=${id}`}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md"
            >
              + New {FUTURE_COPY.moduleOne}
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {modules.length === 0 ? (
              <li className="py-12 text-center text-slate-500">No {FUTURE_COPY.moduleMany} yet.</li>
            ) : (
              modules.map((m, i) => (
                <li key={m.id}>
                  <FutureModuleListCard
                    mod={m}
                    href={`/admin/the-future/modules/${m.id}`}
                    index={i}
                    showDraft
                  />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
