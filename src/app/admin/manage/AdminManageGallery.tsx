"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ADMIN_BTN,
  ADMIN_BTN_DANGER,
  ADMIN_BTN_GHOST,
  ADMIN_BUBBLE_PAD,
  ADMIN_KICKER,
  ADMIN_PAGE,
  ADMIN_ROW,
} from "@/components/admin/admin-ui";
import { createBrowserSupabase } from "@/lib/supabase/client";

type Row = { id: string; title: string; public_url: string; poster_url?: string | null; sort_order: number };
type SocialRow = { id: string; title: string; url: string; thumbnail_url?: string; tag?: string; sort_order: number };

const GALLERY_DND_MIME = "application/x-yourailens-gallery-id";

function applyReorder<T extends { id: string }>(items: T[], activeId: string, overId: string): T[] {
  if (activeId === overId) return items;
  const from = items.findIndex((x) => x.id === activeId);
  const to = items.findIndex((x) => x.id === overId);
  if (from === -1 || to === -1) return items;
  const next = [...items];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

function GalleryDragHandle({
  id,
  gallery,
  disabled,
}: {
  id: string;
  gallery: "images" | "films";
  disabled?: boolean;
}) {
  return (
    <div
      draggable={!disabled}
      aria-label="Drag to reorder"
      title="Drag to reorder"
      onDragStart={(e) => {
        e.dataTransfer.setData(GALLERY_DND_MIME, JSON.stringify({ gallery, id }));
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`mb-2 flex items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/55 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <span className="select-none text-white/35" aria-hidden>
        ⋮⋮
      </span>
      Drag to reorder
    </div>
  );
}

export default function AdminManageGallery() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [images, setImages] = useState<Row[]>([]);
  const [films, setFilms] = useState<Row[]>([]);
  const [instagramLinks, setInstagramLinks] = useState<SocialRow[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<SocialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [busyPosterId, setBusyPosterId] = useState<string | null>(null);
  const [busyReorder, setBusyReorder] = useState<"images" | "films" | null>(null);

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const [imgRes, filmRes, igRes, ytRes] = await Promise.all([
        supabase.from("gallery_images").select("id,title,public_url,sort_order").order("sort_order", { ascending: true }),
        supabase.from("gallery_films").select("id,title,public_url,poster_url,sort_order").order("sort_order", { ascending: true }),
        supabase.from("instagram_links").select("id,title,url,thumbnail_url,tag,sort_order").order("sort_order", { ascending: true }),
        supabase.from("youtube_links").select("id,title,url,thumbnail_url,tag,sort_order").order("sort_order", { ascending: true }),
      ]);
      if (imgRes.error) throw imgRes.error;
      if (filmRes.error) throw filmRes.error;
      if (igRes.error) throw igRes.error;
      if (ytRes.error) throw ytRes.error;
      setImages((imgRes.data ?? []) as Row[]);
      setFilms((filmRes.data ?? []) as Row[]);
      setInstagramLinks((igRes.data ?? []) as SocialRow[]);
      setYoutubeLinks((ytRes.data ?? []) as SocialRow[]);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to load gallery rows.");
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
      await loadLists();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadLists]);

  function onGalleryDrop(
    e: React.DragEvent,
    targetGallery: "images" | "films",
    overId: string,
  ) {
    e.preventDefault();
    const raw = e.dataTransfer.getData(GALLERY_DND_MIME);
    if (!raw) return;
    let parsed: { gallery: "images" | "films"; id: string };
    try {
      parsed = JSON.parse(raw) as { gallery: "images" | "films"; id: string };
    } catch {
      return;
    }
    if (parsed.gallery !== targetGallery) return;
    const list = targetGallery === "images" ? images : films;
    const next = applyReorder(list, parsed.id, overId);
    if (next === list) return;
    void saveGalleryOrder(targetGallery, next.map((r) => r.id));
  }

  async function saveGalleryOrder(gallery: "images" | "films", orderedIds: string[]) {
    setBusyReorder(gallery);
    setMsg("");
    const res = await fetch("/api/admin/reorder-gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery, orderedIds }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyReorder(null);
    if (!res.ok) {
      setMsg(j.error || "Could not save order");
      return;
    }
    setMsg(gallery === "images" ? "Image order saved." : "Film order saved.");
    await loadLists();
  }

  async function deleteImage(id: string) {
    if (!confirm("Delete this image from the gallery?")) return;
    setBusyDeleteId(id);
    const res = await fetch("/api/admin/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyDeleteId(null);
    if (!res.ok) {
      setMsg(j.error || "Delete failed");
      return;
    }
    setMsg("Image deleted.");
    await loadLists();
  }

  async function regenerateFilmPoster(id: string) {
    setMsg("");
    setBusyPosterId(id);
    const res = await fetch("/api/admin/regenerate-film-poster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; posterError?: string; posterUrl?: string };
    setBusyPosterId(null);
    if (!res.ok) {
      setMsg(j.posterError || j.error || "Could not regenerate poster");
      return;
    }
    if (j.posterUrl) {
      setMsg(`Poster updated. ${j.posterUrl}`);
    } else {
      setMsg("Poster updated.");
    }
    await loadLists();
  }

  async function deleteFilm(id: string) {
    if (!confirm("Delete this film from the gallery?")) return;
    setBusyDeleteId(id);
    const res = await fetch("/api/admin/delete-film", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyDeleteId(null);
    if (!res.ok) {
      setMsg(j.error || "Delete failed");
      return;
    }
    setMsg("Film deleted.");
    await loadLists();
  }

  async function deleteInstagramLink(id: string) {
    if (!confirm("Delete this Instagram link?")) return;
    setBusyDeleteId(id);
    const res = await fetch("/api/admin/delete-instagram-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyDeleteId(null);
    if (!res.ok) {
      setMsg(j.error || "Delete failed");
      return;
    }
    setMsg("Instagram link deleted.");
    await loadLists();
  }

  async function deleteYoutubeLink(id: string) {
    if (!confirm("Delete this YouTube link?")) return;
    setBusyDeleteId(id);
    const res = await fetch("/api/admin/delete-youtube-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyDeleteId(null);
    if (!res.ok) {
      setMsg(j.error || "Delete failed");
      return;
    }
    setMsg("YouTube link deleted.");
    await loadLists();
  }

  if (sessionOk === false) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-heading text-2xl leading-none">Not authorized</h2>
        <p className="mt-3 text-sm text-white/50">Sign in with the admin password to manage uploads.</p>
        <Link href="/admin/login" className={`mt-6 inline-flex ${ADMIN_BTN}`}>
          Go to admin login
        </Link>
      </div>
    );
  }

  if (sessionOk === null) {
    return <div className="py-16 text-center text-sm text-white/45">Loading…</div>;
  }

  return (
    <div className={ADMIN_PAGE}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={ADMIN_KICKER}>Stage</p>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
            Reorder, delete, and manage gallery items.
          </p>
        </div>
        <Link href="/admin" className={ADMIN_BTN_GHOST}>
          Upload on desk
        </Link>
      </header>

      {msg ? <p className={`${ADMIN_ROW} text-sm text-emerald-200`}>{msg}</p> : null}

      <section className={ADMIN_BUBBLE_PAD}>
        <h2 className="font-heading text-xl leading-none">Images</h2>
        <p className="mt-2 text-xs text-white/40">Order on the site: top / left = first. Drag cards by the handle to reorder.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm text-white/45">Loading…</p>
          ) : images.length === 0 ? (
            <p className="text-sm text-white/45">No images found.</p>
          ) : (
            images.map((row) => (
              <article
                key={row.id}
                className={ADMIN_ROW}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => onGalleryDrop(e, "images", row.id)}
              >
                <GalleryDragHandle id={row.id} gallery="images" disabled={busyReorder === "images"} />
                <div className="relative h-44 overflow-hidden rounded-2xl bg-black/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={row.public_url} alt={row.title} className="h-full w-full object-cover" draggable={false} />
                </div>
                <p className="mt-3 truncate font-semibold text-white">{row.title}</p>
                <p className="mt-1 break-all font-mono text-[11px] text-white/35">{row.public_url}</p>
                <button
                  type="button"
                  onClick={() => deleteImage(row.id)}
                  disabled={busyDeleteId === row.id || busyReorder === "images"}
                  className={`mt-2 ${ADMIN_BTN_DANGER} disabled:opacity-50`}
                >
                  {busyDeleteId === row.id ? "Deleting…" : "Delete"}
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section className={ADMIN_BUBBLE_PAD}>
        <h2 className="font-heading text-xl leading-none">Films</h2>
        <p className="mt-2 text-xs text-white/40">
          Order on the site: top / left = first. Drag cards by the handle to reorder (not the video).
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm text-white/45">Loading…</p>
          ) : films.length === 0 ? (
            <p className="text-sm text-white/45">No films found.</p>
          ) : (
            films.map((row) => (
              <article
                key={row.id}
                className={ADMIN_ROW}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => onGalleryDrop(e, "films", row.id)}
              >
                <GalleryDragHandle id={row.id} gallery="films" disabled={busyReorder === "films"} />
                <video
                  src={row.public_url}
                  className="h-44 w-full rounded-2xl bg-black object-cover"
                  controls
                  playsInline
                  draggable={false}
                />
                <p className="mt-3 truncate font-semibold text-white">{row.title}</p>
                <p className="mt-1 break-all font-mono text-[11px] text-white/35">{row.public_url}</p>
                {row.poster_url ? (
                  <p className="mt-2 truncate font-mono text-[10px] text-white/30" title={row.poster_url}>
                    Poster: {row.poster_url}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-amber-200/80">
                    No poster URL yet — regenerate after deploy, or check video URL is a direct file.
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => regenerateFilmPoster(row.id)}
                    disabled={busyPosterId === row.id || busyDeleteId === row.id || busyReorder === "films"}
                    className={`${ADMIN_BTN_GHOST} !py-1.5 text-xs disabled:opacity-50`}
                  >
                    {busyPosterId === row.id ? "Regenerating…" : "Regenerate poster"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFilm(row.id)}
                    disabled={busyDeleteId === row.id || busyPosterId === row.id || busyReorder === "films"}
                    className={`${ADMIN_BTN_DANGER} disabled:opacity-50`}
                  >
                    {busyDeleteId === row.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className={ADMIN_BUBBLE_PAD}>
        <h2 className="font-heading text-xl leading-none">Instagram links</h2>
        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-sm text-white/45">Loading…</p>
          ) : instagramLinks.length === 0 ? (
            <p className="text-sm text-white/45">No Instagram links found.</p>
          ) : (
            instagramLinks.map((row) => (
              <div key={row.id} className={ADMIN_ROW}>
                {row.thumbnail_url ? (
                  <div className="relative mb-3 h-36 w-full overflow-hidden rounded-2xl bg-black/50 sm:w-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.thumbnail_url} alt={row.title} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <p className="font-semibold text-white">{row.title}</p>
                {row.tag ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-300/80">Tag: {row.tag}</p>
                ) : null}
                <p className="mt-1 break-all font-mono text-[11px] text-white/35">{row.url}</p>
                <button
                  type="button"
                  onClick={() => deleteInstagramLink(row.id)}
                  disabled={busyDeleteId === row.id}
                  className={`mt-3 ${ADMIN_BTN_DANGER} disabled:opacity-50`}
                >
                  {busyDeleteId === row.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={ADMIN_BUBBLE_PAD}>
        <h2 className="font-heading text-xl leading-none">YouTube links</h2>
        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-sm text-white/45">Loading…</p>
          ) : youtubeLinks.length === 0 ? (
            <p className="text-sm text-white/45">No YouTube links found.</p>
          ) : (
            youtubeLinks.map((row) => (
              <div key={row.id} className={ADMIN_ROW}>
                {row.thumbnail_url ? (
                  <div className="relative mb-3 h-36 w-full overflow-hidden rounded-2xl bg-black/50 sm:w-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.thumbnail_url} alt={row.title} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <p className="font-semibold text-white">{row.title}</p>
                {row.tag ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-300/80">Tag: {row.tag}</p>
                ) : null}
                <p className="mt-1 break-all font-mono text-[11px] text-white/35">{row.url}</p>
                <button
                  type="button"
                  onClick={() => deleteYoutubeLink(row.id)}
                  disabled={busyDeleteId === row.id}
                  className={`mt-3 ${ADMIN_BTN_DANGER} disabled:opacity-50`}
                >
                  {busyDeleteId === row.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
