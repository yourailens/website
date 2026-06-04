"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import type {
  SampleBrandAspectRatio,
  SampleBrandMedia,
  SampleBrandMediaCategory,
  SampleBrandMediaType,
  SampleBrandWithMedia,
} from "@/data/sample-brands";
import {
  SAMPLE_BRAND_ASPECT_RATIOS,
  SAMPLE_BRAND_MEDIA_CATEGORIES,
  aspectRatioLabel,
  categoryLabel,
} from "@/data/sample-brands";
import { aspectRatioClass, resolveMediaType } from "@/lib/sample-brands/media";
import {
  SampleBrandMediaSlotFields,
  type SampleBrandSlotValue,
} from "../SampleBrandMediaSlotFields";

async function uploadMedia(file: File, slug: string) {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("slug", slug);
  const res = await fetch("/api/admin/sample-brands/upload-media", { method: "POST", body: fd });
  const data = (await res.json()) as { url?: string; media_type?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return { url: data.url, media_type: (data.media_type ?? "image") as SampleBrandMediaType };
}

const emptySlot = (): SampleBrandSlotValue => ({
  url: "",
  mediaType: "image",
  aspectRatio: "landscape",
  posterUrl: "",
  caption: "",
});

export default function AdminSampleBrandEditor() {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<SampleBrandWithMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [hero, setHero] = useState<SampleBrandSlotValue>(emptySlot());
  const [cover, setCover] = useState<SampleBrandSlotValue>(emptySlot());
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(false);

  const [draftType, setDraftType] = useState<SampleBrandMediaType>("image");
  const [draftRatio, setDraftRatio] = useState<SampleBrandAspectRatio>("landscape");
  const [draftCategory, setDraftCategory] = useState<SampleBrandMediaCategory>("situations");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftCaption, setDraftCaption] = useState("");
  const [draftPoster, setDraftPoster] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sample-brands/${id}`);
      const data = (await res.json()) as { brand?: SampleBrandWithMedia };
      const b = data.brand ?? null;
      setBrand(b);
      if (b) {
        setName(b.name);
        setSlug(b.slug);
        setTagline(b.tagline ?? "");
        setDescription(b.description ?? "");
        setHero({
          url: b.hero_image_url ?? "",
          mediaType: b.hero_media_type,
          aspectRatio: b.hero_aspect_ratio,
          posterUrl: b.hero_poster_url ?? "",
          caption: b.hero_caption ?? "",
        });
        setCover({
          url: b.cover_image_url ?? "",
          mediaType: b.cover_media_type,
          aspectRatio: b.cover_aspect_ratio,
          posterUrl: b.cover_poster_url ?? "",
          caption: "",
        });
        setSortOrder(b.sort_order);
        setPublished(b.published);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadSlug = slug || "sample-brand";

  const groupedMedia = useMemo(() => {
    if (!brand) return { image: [] as SampleBrandMedia[], video: [] as SampleBrandMedia[] };
    const sorted = [...brand.media].sort((a, b) => a.sort_order - b.sort_order);
    return {
      image: sorted.filter((m) => m.media_type === "image"),
      video: sorted.filter((m) => m.media_type === "video"),
    };
  }, [brand]);

  const saveBrand = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/sample-brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug.trim().toLowerCase(),
          tagline: tagline || null,
          description: description || null,
          hero_image_url: hero.url.trim() || null,
          hero_media_type: hero.mediaType,
          hero_aspect_ratio: hero.aspectRatio,
          hero_poster_url: hero.posterUrl.trim() || null,
          hero_caption: hero.caption.trim() || null,
          cover_image_url: cover.url.trim() || null,
          cover_media_type: cover.mediaType,
          cover_aspect_ratio: cover.aspectRatio,
          cover_poster_url: cover.posterUrl.trim() || null,
          sort_order: sortOrder,
          published,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }
      setMsg("Brand saved.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const addMedia = async () => {
    if (!draftUrl.trim()) {
      setMsg("Upload or paste a media URL first.");
      return;
    }
    setUploading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/sample-brands/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: id,
          media_url: draftUrl.trim(),
          media_type: draftType,
          aspect_ratio: draftRatio,
          category: draftCategory,
          label: draftLabel.trim() || null,
          caption: draftCaption.trim() || null,
          poster_url: draftPoster.trim() || null,
          sort_order: brand?.media.length ?? 0,
          published: true,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Could not add media");
      }
      setDraftUrl("");
      setDraftLabel("");
      setDraftCaption("");
      setDraftPoster("");
      setMsg("Asset added to gallery.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setUploading(false);
    }
  };

  const patchMedia = async (mediaId: string, patch: Record<string, unknown>) => {
    await fetch(`/api/admin/sample-brands/media/${mediaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  };

  const deleteMedia = async (mediaId: string) => {
    if (!confirm("Delete this asset?")) return;
    await fetch(`/api/admin/sample-brands/media/${mediaId}`, { method: "DELETE" });
    await load();
  };

  const MediaThumb = ({ item }: { item: SampleBrandMedia }) => {
    const type = resolveMediaType(item.media_type, item.media_url);
    return (
      <div className={`relative w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ${aspectRatioClass(item.aspect_ratio)}`}>
        {type === "video" ? (
          <video src={item.media_url} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <Image src={item.media_url} alt="" fill className="object-cover" unoptimized sizes="80px" />
        )}
      </div>
    );
  };

  const renderMediaList = (items: SampleBrandMedia[], title: string) => (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">No {title.toLowerCase()} yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
            >
              <MediaThumb item={item} />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  {categoryLabel(item.category)} · {aspectRatioLabel(item.aspect_ratio)}
                  {!item.published ? (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">Draft</span>
                  ) : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={item.category}
                    onChange={(e) =>
                      patchMedia(item.id, { category: e.target.value as SampleBrandMediaCategory })
                    }
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                  >
                    {SAMPLE_BRAND_MEDIA_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.short}
                      </option>
                    ))}
                  </select>
                  <select
                    value={item.aspect_ratio}
                    onChange={(e) =>
                      patchMedia(item.id, { aspect_ratio: e.target.value as SampleBrandAspectRatio })
                    }
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                  >
                    {SAMPLE_BRAND_ASPECT_RATIOS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={item.label ?? ""}
                  onChange={(e) => patchMedia(item.id, { label: e.target.value || null })}
                  placeholder="Label (subtle)"
                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                />
                <input
                  value={item.caption ?? ""}
                  onChange={(e) => patchMedia(item.id, { caption: e.target.value || null })}
                  placeholder="Caption"
                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => patchMedia(item.id, { published: !item.published })}
                    className="rounded border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600"
                  >
                    {item.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMedia(item.id)}
                    className="rounded border border-red-200 px-2 py-1 text-[10px] font-bold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-6">
        <p>Brand not found.</p>
        <Link href="/admin/sample-brands">← Back</Link>
      </div>
    );
  }

  const previewPath =
    brand.industry_slug && published
      ? `/industries/${brand.industry_slug}/brands/${slug}`
      : brand.industry_slug
        ? `/industries/${brand.industry_slug}/brands/${slug}`
        : null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/sample-brands" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          ← Sample brands
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {brand.industry_name}
            </p>
            <h1 className="font-heading text-2xl font-black text-slate-900">{name || brand.name}</h1>
          </div>
          {previewPath ? (
            <a
              href={previewPath}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Preview {published ? "live" : "(draft — publish industry + brand)"} →
            </a>
          ) : null}
        </div>

        {msg ? (
          <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{msg}</p>
        ) : null}

        <section className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Identity</h2>
          <label className="block text-[10px] font-medium text-slate-600">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-[10px] font-medium text-slate-600">
            Slug
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-[10px] font-medium text-slate-600">
            Tagline (one line on public page)
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-[10px] font-medium text-slate-600">
            Description (optional footnote)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-[10px] font-medium text-slate-600">
              Sort order
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-1 w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>
          </div>
        </section>

        <section className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Hero &amp; card cover</h2>
          <SampleBrandMediaSlotFields
            label="Hero (top of brand page)"
            hint="Full-bleed opening visual — any ratio."
            value={hero}
            onChange={setHero}
            onUpload={(f) => uploadMedia(f, uploadSlug)}
          />
          <SampleBrandMediaSlotFields
            label="Card cover (industry listing grid)"
            hint="Used on industry page brand cards if set; falls back to hero."
            value={cover}
            onChange={setCover}
            onUpload={(f) => uploadMedia(f, uploadSlug)}
            showCaption={false}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5">
          <h2 className="text-sm font-bold text-slate-900">Add gallery asset</h2>
          <p className="mt-1 text-xs text-slate-500">
            Tag type, aspect ratio, and category — the public page groups by category with ratio filters.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["image", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDraftType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  draftType === t ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {t === "image" ? "Image" : "Video"}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_BRAND_ASPECT_RATIOS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDraftRatio(r.value)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  draftRatio === r.value ? "bg-blue-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_BRAND_MEDIA_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setDraftCategory(c.value)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  draftCategory === c.value ? "bg-blue-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {c.short}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-[10px] font-medium text-slate-600">
            Media URL
            <input
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            className="mt-2 w-full text-xs"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const { url, media_type } = await uploadMedia(f, uploadSlug);
                setDraftUrl(url);
                setDraftType(media_type);
              } catch (err) {
                setMsg(err instanceof Error ? err.message : "Upload failed");
              }
              e.target.value = "";
            }}
          />
          {draftType === "video" ? (
            <label className="mt-3 block text-[10px] font-medium text-slate-600">
              Poster URL
              <input
                value={draftPoster}
                onChange={(e) => setDraftPoster(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] font-medium text-slate-600">
              Label
              <input
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-[10px] font-medium text-slate-600">
              Caption
              <input
                value={draftCaption}
                onChange={(e) => setDraftCaption(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={addMedia}
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {uploading ? "Adding…" : "Add to gallery"}
          </button>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Gallery library</h2>
          {renderMediaList(groupedMedia.image, "Images")}
          {renderMediaList(groupedMedia.video, "Videos")}
        </section>

        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl justify-end gap-3">
            <button
              type="button"
              onClick={saveBrand}
              disabled={saving}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save brand"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
