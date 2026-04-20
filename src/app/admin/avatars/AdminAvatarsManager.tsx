"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/client";
import type { AvatarSlug } from "@/lib/avatars/config";
import { AVATAR_SLUGS } from "@/lib/avatars/config";
import AvatarCropModal from "@/components/avatars/AvatarCropModal";

type Row = {
  slug: AvatarSlug;
  display_name: string;
  headline: string;
  story: string;
  hero_image_url: string | null;
};

type GalleryRow = { id: string; public_url: string; sort_order: number };

type CropJob = {
  src: string;
  slug: AvatarSlug;
  kind: "hero" | "gallery";
};

export default function AdminAvatarsManager() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [galleryBySlug, setGalleryBySlug] = useState<Record<AvatarSlug, GalleryRow[]>>({
    kaira: [],
    akriti: [],
    niharika: [],
    akanksha: [],
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busySlug, setBusySlug] = useState<AvatarSlug | null>(null);
  const [copyDraft, setCopyDraft] = useState<Record<AvatarSlug, { headline: string; story: string }>>({
    kaira: { headline: "", story: "" },
    akriti: { headline: "", story: "" },
    niharika: { headline: "", story: "" },
    akanksha: { headline: "", story: "" },
  });

  const [cropJob, setCropJob] = useState<CropJob | null>(null);
  const galleryQueueRef = useRef<File[]>([]);
  const galleryQueueSlugRef = useRef<AvatarSlug | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const supabase = createBrowserSupabase();
      const { data: ch, error: e1 } = await supabase
        .from("avatar_characters")
        .select("slug,display_name,headline,story,hero_image_url")
        .in("slug", [...AVATAR_SLUGS]);
      if (e1) throw e1;
      const list = (ch ?? []) as Row[];
      const order = new Map(AVATAR_SLUGS.map((s, i) => [s, i]));
      list.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
      setRows(list);
      const drafts: Record<AvatarSlug, { headline: string; story: string }> = {
        kaira: { headline: "", story: "" },
        akriti: { headline: "", story: "" },
        niharika: { headline: "", story: "" },
        akanksha: { headline: "", story: "" },
      };
      for (const r of list) {
        drafts[r.slug] = { headline: r.headline, story: r.story };
      }
      setCopyDraft(drafts);

      const { data: imgs, error: e2 } = await supabase
        .from("avatar_character_images")
        .select("id,character_slug,public_url,sort_order")
        .in("character_slug", [...AVATAR_SLUGS])
        .order("sort_order", { ascending: true });
      if (e2) throw e2;
      const next: Record<AvatarSlug, GalleryRow[]> = {
        kaira: [],
        akriti: [],
        niharika: [],
        akanksha: [],
      };
      for (const g of imgs ?? []) {
        const slug = g.character_slug as AvatarSlug;
        if (next[slug])
          next[slug].push({
            id: g.id,
            public_url: g.public_url,
            sort_order: g.sort_order,
          });
      }
      setGalleryBySlug(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load avatars.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/session", { method: "GET" });
      if (cancelled) return;
      if (!res.ok) {
        setSessionOk(false);
        setLoading(false);
        return;
      }
      setSessionOk(true);
      await loadAll();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  useEffect(() => {
    return () => {
      if (cropJob?.src.startsWith("blob:")) URL.revokeObjectURL(cropJob.src);
    };
  }, [cropJob]);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function saveCopy(slug: AvatarSlug) {
    setBusySlug(slug);
    setMsg("");
    setErr("");
    const d = copyDraft[slug];
    const res = await fetch("/api/admin/avatar-character", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, headline: d.headline, story: d.story }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusySlug(null);
    if (!res.ok) {
      setErr(j.error || "Save failed");
      return;
    }
    setMsg(`Saved copy for ${slug}.`);
    await loadAll();
  }

  async function uploadBlobToServer(blob: Blob, filename: string, slug: AvatarSlug, kind: "hero" | "gallery") {
    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("kind", kind);
    fd.append("file", blob, filename);
    const res = await fetch("/api/admin/avatar-image", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(j.error || "Upload failed");
  }

  async function uploadRawFile(file: File, slug: AvatarSlug, kind: "hero" | "gallery") {
    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("kind", kind);
    fd.append("file", file);
    const res = await fetch("/api/admin/avatar-image", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(j.error || "Upload failed");
  }

  function startHeroCrop(file: File | null, slug: AvatarSlug) {
    if (!file) return;
    const src = URL.createObjectURL(file);
    setCropJob({ src, slug, kind: "hero" });
  }

  function startNextGalleryCrop(slug: AvatarSlug) {
    const next = galleryQueueRef.current.shift();
    if (!next) {
      galleryQueueSlugRef.current = null;
      return;
    }
    setCropJob({ src: URL.createObjectURL(next), slug, kind: "gallery" });
  }

  function enqueueGalleryFiles(files: FileList | null, slug: AvatarSlug) {
    if (!files?.length) return;
    galleryQueueRef.current.push(...Array.from(files));
    galleryQueueSlugRef.current = slug;
    setCropJob((prev) => {
      if (prev) return prev;
      const next = galleryQueueRef.current.shift();
      if (!next) return null;
      return { src: URL.createObjectURL(next), slug, kind: "gallery" as const };
    });
  }

  async function onCropModalComplete(blob: Blob, filename: string) {
    if (!cropJob) return;
    const { slug, kind } = cropJob;
    if (cropJob.src.startsWith("blob:")) URL.revokeObjectURL(cropJob.src);
    setCropJob(null);
    setBusySlug(slug);
    setErr("");
    setMsg("");
    try {
      await uploadBlobToServer(blob, filename, slug, kind);
      setMsg(kind === "hero" ? "Hero image updated." : "Gallery image added.");
      await loadAll();
      if (kind === "gallery" && galleryQueueSlugRef.current === slug && galleryQueueRef.current.length > 0) {
        startNextGalleryCrop(slug);
      } else if (
        kind === "hero" &&
        galleryQueueSlugRef.current === slug &&
        galleryQueueRef.current.length > 0
      ) {
        startNextGalleryCrop(slug);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusySlug(null);
    }
  }

  function onCropModalCancel() {
    if (cropJob?.src.startsWith("blob:")) URL.revokeObjectURL(cropJob.src);
    const kind = cropJob?.kind;
    setCropJob(null);
    if (kind === "gallery") {
      galleryQueueRef.current = [];
      galleryQueueSlugRef.current = null;
    }
  }

  async function clearHero(slug: AvatarSlug) {
    if (!confirm("Remove hero image for this character?")) return;
    setBusySlug(slug);
    setMsg("");
    setErr("");
    const res = await fetch("/api/admin/delete-avatar-asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, clearHero: true }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusySlug(null);
    if (!res.ok) {
      setErr(j.error || "Could not clear hero");
      return;
    }
    setMsg("Hero image removed.");
    await loadAll();
  }

  async function deleteGallery(slug: AvatarSlug, id: string) {
    if (!confirm("Delete this gallery image?")) return;
    setBusySlug(slug);
    setMsg("");
    setErr("");
    const res = await fetch("/api/admin/delete-avatar-asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, galleryImageId: id }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusySlug(null);
    if (!res.ok) {
      setErr(j.error || "Delete failed");
      return;
    }
    setMsg("Gallery image deleted.");
    await loadAll();
  }

  if (sessionOk === false) {
    return (
      <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-heading text-2xl font-bold">Not authorized</h1>
          <Link href="/admin/login" className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
            Go to admin login
          </Link>
        </div>
      </main>
    );
  }

  if (sessionOk === null || loading) {
    return (
      <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-lg text-center text-sm text-slate-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-16 text-slate-900">
      {cropJob ? (
        <AvatarCropModal
          imageSrc={cropJob.src}
          title={cropJob.kind === "hero" ? "Crop hero image" : "Crop gallery image"}
          onCancel={onCropModalCancel}
          onComplete={onCropModalComplete}
        />
      ) : null}

      <div className="mx-auto max-w-4xl space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">Admin</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">Avatar characters</h1>
            <p className="mt-1 text-sm text-slate-600">
              Crop with drag + zoom (scroll or slider), then save. Gallery: select many files — you&apos;ll crop each in order.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              Gallery uploads
            </Link>
            <Link href="/avatars" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              View avatars
            </Link>
            <button type="button" onClick={signOut} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Sign out
            </button>
          </div>
        </header>

        {err ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{err}</p> : null}
        {msg ? <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">{msg}</p> : null}

        <div className="space-y-12">
          {rows.map((row) => {
            const slug = row.slug;
            const busy = busySlug === slug;
            const gal = galleryBySlug[slug] ?? [];
            return (
              <section key={slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-heading text-xl font-bold">{row.display_name}</h2>
                  <span className="font-mono text-xs text-slate-500">/avatars/{slug}</span>
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hero image</p>
                    <div className="mt-2 relative max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {row.hero_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.hero_image_url} alt="" className="max-h-64 w-full object-contain" />
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-slate-400">No hero yet</div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                        Crop &amp; upload hero
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={busy || !!cropJob}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            startHeroCrop(f ?? null, slug);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={busy || !!cropJob}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = () => {
                            const f = input.files?.[0];
                            if (f)
                              void (async () => {
                                setBusySlug(slug);
                                setErr("");
                                try {
                                  await uploadRawFile(f, slug, "hero");
                                  setMsg("Hero uploaded (original file).");
                                  await loadAll();
                                } catch (er) {
                                  setErr(er instanceof Error ? er.message : "Upload failed");
                                } finally {
                                  setBusySlug(null);
                                }
                              })();
                          };
                          input.click();
                        }}
                        className="rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                      >
                        Upload original (no crop)
                      </button>
                      {row.hero_image_url ? (
                        <button
                          type="button"
                          disabled={busy || !!cropJob}
                          onClick={() => void clearHero(slug)}
                          className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove hero
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Headline &amp; story</p>
                    <label className="mt-2 block text-xs text-slate-600">
                      Headline
                      <input
                        type="text"
                        value={copyDraft[slug].headline}
                        onChange={(e) =>
                          setCopyDraft((prev) => ({ ...prev, [slug]: { ...prev[slug], headline: e.target.value } }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="mt-3 block text-xs text-slate-600">
                      Story (paragraphs — blank lines between)
                      <textarea
                        value={copyDraft[slug].story}
                        onChange={(e) =>
                          setCopyDraft((prev) => ({ ...prev, [slug]: { ...prev[slug], story: e.target.value } }))
                        }
                        rows={6}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busy || !!cropJob}
                      onClick={() => void saveCopy(slug)}
                      className="mt-3 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {busy ? "Saving…" : "Save copy"}
                    </button>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gallery</p>
                  <p className="mt-1 text-xs text-slate-500">Add as many images as you want. Multi-select files to crop them one after another.</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <label className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                      Crop &amp; add images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={busy || !!cropJob}
                        onChange={(e) => {
                          enqueueGalleryFiles(e.target.files, slug);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <label className="cursor-pointer rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                      Upload originals (no crop)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={busy || !!cropJob}
                        onChange={(e) => {
                          const files = e.target.files;
                          e.target.value = "";
                          if (!files?.length) return;
                          void (async () => {
                            setBusySlug(slug);
                            setErr("");
                            for (const f of Array.from(files)) {
                              try {
                                await uploadRawFile(f, slug, "gallery");
                              } catch (er) {
                                setErr(er instanceof Error ? er.message : "Upload failed");
                                break;
                              }
                            }
                            setMsg("Gallery images uploaded.");
                            await loadAll();
                            setBusySlug(null);
                          })();
                        }}
                      />
                    </label>
                  </div>
                  {gal.length ? (
                    <ul className="mt-4 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {gal.map((g) => (
                        <li key={g.id} className="overflow-hidden rounded-xl border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={g.public_url} alt="" className="aspect-auto max-h-56 w-full object-contain" />
                          <div className="border-t border-slate-100 p-2">
                            <button
                              type="button"
                              disabled={busy || !!cropJob}
                              onClick={() => void deleteGallery(slug, g.id)}
                              className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No gallery images yet.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
