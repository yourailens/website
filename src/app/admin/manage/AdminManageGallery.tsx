"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
      className={`mb-2 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white/80 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <span className="select-none text-slate-400" aria-hidden>
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

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

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
      <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-heading text-2xl font-bold">Not authorized</h1>
          <p className="mt-3 text-sm text-slate-600">Sign in with the admin password to manage uploads.</p>
          <Link href="/admin/login" className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
            Go to admin login
          </Link>
        </div>
      </main>
    );
  }

  if (sessionOk === null) {
    return (
      <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-lg text-center text-sm text-slate-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">Admin</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">Manage uploaded items</h1>
            <p className="mt-1 text-sm text-slate-600">Reorder, delete, and manage gallery items</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              Back to upload page
            </Link>
            <Link href="/admin/avatars" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              Avatar images
            </Link>
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              View site
            </Link>
            <button type="button" onClick={signOut} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Sign out
            </button>
          </div>
        </header>

        {msg ? <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">{msg}</p> : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">Images</h2>
          <p className="mt-1 text-xs text-slate-500">Order on the site: top / left = first. Drag cards by the handle to reorder.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : images.length === 0 ? (
              <p className="text-sm text-slate-500">No images found.</p>
            ) : (
              images.map((row) => (
                <article
                  key={row.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => onGalleryDrop(e, "images", row.id)}
                >
                  <GalleryDragHandle id={row.id} gallery="images" disabled={busyReorder === "images"} />
                  <div className="relative h-44 overflow-hidden rounded-lg bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.public_url}
                      alt={row.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <p className="mt-3 truncate font-semibold text-slate-900">{row.title}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{row.public_url}</p>
                  <button
                    type="button"
                    onClick={() => deleteImage(row.id)}
                    disabled={busyDeleteId === row.id || busyReorder === "images"}
                    className="mt-2 rounded-full border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-800 disabled:opacity-50"
                  >
                    {busyDeleteId === row.id ? "Deleting..." : "Delete"}
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">Films</h2>
          <p className="mt-1 text-xs text-slate-500">Order on the site: top / left = first. Drag cards by the handle to reorder (not the video).</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : films.length === 0 ? (
              <p className="text-sm text-slate-500">No films found.</p>
            ) : (
              films.map((row) => (
                <article
                  key={row.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => onGalleryDrop(e, "films", row.id)}
                >
                  <GalleryDragHandle id={row.id} gallery="films" disabled={busyReorder === "films"} />
                  <video
                    src={row.public_url}
                    className="h-44 w-full rounded-lg bg-black object-cover"
                    controls
                    playsInline
                    draggable={false}
                  />
                  <p className="mt-3 truncate font-semibold text-slate-900">{row.title}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{row.public_url}</p>
                  {row.poster_url ? (
                    <p className="mt-2 truncate font-mono text-[10px] text-slate-400" title={row.poster_url}>
                      Poster: {row.poster_url}
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-amber-800">No poster URL yet — regenerate after deploy, or check video URL is a direct file.</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => regenerateFilmPoster(row.id)}
                      disabled={busyPosterId === row.id || busyDeleteId === row.id || busyReorder === "films"}
                      className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 disabled:opacity-50"
                    >
                      {busyPosterId === row.id ? "Regenerating…" : "Regenerate poster"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFilm(row.id)}
                      disabled={busyDeleteId === row.id || busyPosterId === row.id || busyReorder === "films"}
                      className="rounded-full border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-800 disabled:opacity-50"
                    >
                      {busyDeleteId === row.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">Instagram links</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : instagramLinks.length === 0 ? (
              <p className="text-sm text-slate-500">No Instagram links found.</p>
            ) : (
              instagramLinks.map((row) => (
                <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {row.thumbnail_url ? (
                    <div className="mb-3 relative h-36 w-full overflow-hidden rounded-lg bg-white sm:w-56">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.thumbnail_url} alt={row.title} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <p className="font-semibold text-slate-900">{row.title}</p>
                  {row.tag ? <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-700">Tag: {row.tag}</p> : null}
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{row.url}</p>
                  <button
                    type="button"
                    onClick={() => deleteInstagramLink(row.id)}
                    disabled={busyDeleteId === row.id}
                    className="mt-3 rounded-full border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-800 disabled:opacity-50"
                  >
                    {busyDeleteId === row.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">YouTube links</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : youtubeLinks.length === 0 ? (
              <p className="text-sm text-slate-500">No YouTube links found.</p>
            ) : (
              youtubeLinks.map((row) => (
                <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {row.thumbnail_url ? (
                    <div className="mb-3 relative h-36 w-full overflow-hidden rounded-lg bg-white sm:w-56">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.thumbnail_url} alt={row.title} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <p className="font-semibold text-slate-900">{row.title}</p>
                  {row.tag ? <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-700">Tag: {row.tag}</p> : null}
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{row.url}</p>
                  <button
                    type="button"
                    onClick={() => deleteYoutubeLink(row.id)}
                    disabled={busyDeleteId === row.id}
                    className="mt-3 rounded-full border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-800 disabled:opacity-50"
                  >
                    {busyDeleteId === row.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
