"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHARACTER_TAGS, GALLERY_CATEGORY_TABS, type CharacterTag, type FilmCategory } from "@/data/gallery";

type SavedPreview = { url: string; title: string };

const CATEGORY_OPTIONS = GALLERY_CATEGORY_TABS.filter(
  (t): t is { id: FilmCategory; label: string } => t.id !== null
);

export default function AdminDashboard() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [imgTitle, setImgTitle] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgCategory, setImgCategory] = useState<FilmCategory>("photorealistic");
  const [imgAspect, setImgAspect] = useState<"" | "square" | "portrait" | "landscape">("");
  const [imgPeopleTags, setImgPeopleTags] = useState<CharacterTag[]>([]);
  const [imgPrompt, setImgPrompt] = useState("");
  const [filmTitle, setFilmTitle] = useState("");
  const [filmUrl, setFilmUrl] = useState("");
  const [filmFile, setFilmFile] = useState<File | null>(null);
  const [filmCategory, setFilmCategory] = useState<FilmCategory>("photorealistic");
  const [filmOrientation, setFilmOrientation] = useState<"" | "landscape" | "portrait">("");
  const [filmPeopleTags, setFilmPeopleTags] = useState<CharacterTag[]>([]);
  const [filmPrompt, setFilmPrompt] = useState("");
  const [igTitle, setIgTitle] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [igThumbUrl, setIgThumbUrl] = useState("");
  const [igTag, setIgTag] = useState("");
  const [igFile, setIgFile] = useState<File | null>(null);
  const [ytTitle, setYtTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [ytThumbUrl, setYtThumbUrl] = useState("");
  const [ytTag, setYtTag] = useState("");
  const [ytFile, setYtFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [uploadErr, setUploadErr] = useState<{ message: string; hint?: string } | null>(null);
  const [pendingImgBlobUrl, setPendingImgBlobUrl] = useState<string | null>(null);
  const [pendingFilmBlobUrl, setPendingFilmBlobUrl] = useState<string | null>(null);
  const [pendingIgBlobUrl, setPendingIgBlobUrl] = useState<string | null>(null);
  const [pendingYtBlobUrl, setPendingYtBlobUrl] = useState<string | null>(null);
  const [lastSavedImage, setLastSavedImage] = useState<SavedPreview | null>(null);
  const [lastSavedFilm, setLastSavedFilm] = useState<SavedPreview | null>(null);
  const [busyImage, setBusyImage] = useState(false);
  const [busyFilm, setBusyFilm] = useState(false);
  const [busyIg, setBusyIg] = useState(false);
  const [busyYt, setBusyYt] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/session", { method: "GET" });
      if (cancelled) return;
      setSessionOk(res.ok);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!imgFile) {
      setPendingImgBlobUrl(null);
      return;
    }
    const u = URL.createObjectURL(imgFile);
    setPendingImgBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [imgFile]);

  useEffect(() => {
    if (!filmFile) {
      setPendingFilmBlobUrl(null);
      return;
    }
    const u = URL.createObjectURL(filmFile);
    setPendingFilmBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [filmFile]);

  useEffect(() => {
    if (!igFile) {
      setPendingIgBlobUrl(null);
      return;
    }
    const u = URL.createObjectURL(igFile);
    setPendingIgBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [igFile]);

  useEffect(() => {
    if (!ytFile) {
      setPendingYtBlobUrl(null);
      return;
    }
    const u = URL.createObjectURL(ytFile);
    setPendingYtBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [ytFile]);

  async function copyUrl(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Link copied to clipboard.");
      setUploadErr(null);
    } catch {
      setMsg("Could not copy - select the URL manually.");
    }
  }

  function toggleTag(
    value: CharacterTag,
    setSelected: (updater: (prev: CharacterTag[]) => CharacterTag[]) => void
  ) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function uploadImage(e: React.FormEvent) {
    e.preventDefault();
    const url = imgUrl.trim();
    setMsg("");
    setUploadErr(null);
    if (imgFile) {
      setBusyImage(true);
      const titleSave = imgTitle.trim() || imgFile.name || "Image";
      const fd = new FormData();
      fd.append("file", imgFile);
      fd.append("title", titleSave);
      fd.append("category", imgCategory);
      if (imgAspect) fd.append("aspect", imgAspect);
      if (imgPeopleTags.length) fd.append("peopleTags", imgPeopleTags.join(","));
      if (imgPrompt.trim()) fd.append("prompt", imgPrompt.trim());
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as { error?: string; hint?: string; publicUrl?: string };
      setBusyImage(false);
      if (!res.ok) {
        setUploadErr({ message: j.error || "Could not upload image to S3", hint: j.hint });
        return;
      }
      setLastSavedImage({ url: j.publicUrl ?? "", title: titleSave });
      setImgTitle("");
      setImgUrl("");
      setImgFile(null);
      setImgPeopleTags([]);
      setImgPrompt("");
      setMsg("Saved to gallery. Preview below.");
      return;
    }
    if (!url) {
      setMsg("Paste an image URL or choose a file to upload to S3.");
      return;
    }
    setBusyImage(true);
    const titleSave = imgTitle.trim() || "Image";
    const payload: Record<string, string> = {
      url,
      title: titleSave,
      category: imgCategory,
    };
    if (imgAspect) payload.aspect = imgAspect;
    if (imgPeopleTags.length) payload.peopleTags = imgPeopleTags.join(",");
    if (imgPrompt.trim()) payload.prompt = imgPrompt.trim();
    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string; hint?: string; publicUrl?: string };
    setBusyImage(false);
    if (!res.ok) {
      setUploadErr({ message: j.error || "Could not add image", hint: j.hint });
      return;
    }
    setLastSavedImage({ url: j.publicUrl ?? url, title: titleSave });
    setImgTitle("");
    setImgUrl("");
    setImgPeopleTags([]);
    setImgPrompt("");
    setMsg("Saved to gallery. Preview below.");
  }

  async function uploadFilm(e: React.FormEvent) {
    e.preventDefault();
    const url = filmUrl.trim();
    setMsg("");
    setUploadErr(null);
    if (filmFile) {
      setBusyFilm(true);
      const titleSave = filmTitle.trim() || filmFile.name || "Film";
      const fd = new FormData();
      fd.append("file", filmFile);
      fd.append("title", titleSave);
      fd.append("category", filmCategory);
      if (filmOrientation) fd.append("orientation", filmOrientation);
      if (filmPeopleTags.length) fd.append("peopleTags", filmPeopleTags.join(","));
      if (filmPrompt.trim()) fd.append("prompt", filmPrompt.trim());
      const res = await fetch("/api/admin/upload-film", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        hint?: string;
        publicUrl?: string;
        posterError?: string;
      };
      setBusyFilm(false);
      if (!res.ok) {
        setUploadErr({ message: j.error || "Could not upload video to S3", hint: j.hint });
        return;
      }
      setLastSavedFilm({ url: j.publicUrl ?? "", title: titleSave });
      setFilmTitle("");
      setFilmUrl("");
      setFilmFile(null);
      setFilmPeopleTags([]);
      setFilmPrompt("");
      setMsg(
        j.posterError
          ? `Saved to gallery. Preview below. Open Graph poster was not set: ${j.posterError}`
          : "Saved to gallery. Preview below."
      );
      return;
    }
    if (!url) {
      setMsg("Paste a video URL or choose a file to upload to S3.");
      return;
    }
    setBusyFilm(true);
    const titleSave = filmTitle.trim() || "Film";
    const payload: Record<string, string> = {
      url,
      title: titleSave,
      category: filmCategory,
    };
    if (filmOrientation) payload.orientation = filmOrientation;
    if (filmPeopleTags.length) payload.peopleTags = filmPeopleTags.join(",");
    if (filmPrompt.trim()) payload.prompt = filmPrompt.trim();
    const res = await fetch("/api/admin/upload-film", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string; hint?: string; publicUrl?: string };
    setBusyFilm(false);
    if (!res.ok) {
      setUploadErr({ message: j.error || "Could not add film", hint: j.hint });
      return;
    }
    setLastSavedFilm({ url: j.publicUrl ?? url, title: titleSave });
    setFilmTitle("");
    setFilmUrl("");
    setFilmPeopleTags([]);
    setFilmPrompt("");
    setMsg("Saved to gallery. Preview below.");
  }

  async function addInstagramLink(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setUploadErr(null);
    setBusyIg(true);
    let res: Response;
    if (igFile) {
      const fd = new FormData();
      fd.append("title", igTitle.trim());
      fd.append("url", igUrl.trim());
      fd.append("file", igFile);
      if (igThumbUrl.trim()) fd.append("thumbnailUrl", igThumbUrl.trim());
      if (igTag.trim()) fd.append("tag", igTag.trim());
      res = await fetch("/api/admin/add-instagram-link", { method: "POST", body: fd });
    } else {
      const payload = { title: igTitle.trim(), url: igUrl.trim(), thumbnailUrl: igThumbUrl.trim(), tag: igTag.trim() };
      res = await fetch("/api/admin/add-instagram-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyIg(false);
    if (!res.ok) {
      setUploadErr({ message: j.error || "Could not add Instagram link" });
      return;
    }
    setIgTitle("");
    setIgUrl("");
    setIgThumbUrl("");
    setIgTag("");
    setIgFile(null);
    setMsg("Instagram link added.");
  }

  async function addYoutubeLink(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setUploadErr(null);
    setBusyYt(true);
    let res: Response;
    if (ytFile) {
      const fd = new FormData();
      fd.append("title", ytTitle.trim());
      fd.append("url", ytUrl.trim());
      fd.append("file", ytFile);
      if (ytThumbUrl.trim()) fd.append("thumbnailUrl", ytThumbUrl.trim());
      if (ytTag.trim()) fd.append("tag", ytTag.trim());
      res = await fetch("/api/admin/add-youtube-link", { method: "POST", body: fd });
    } else {
      const payload = { title: ytTitle.trim(), url: ytUrl.trim(), thumbnailUrl: ytThumbUrl.trim(), tag: ytTag.trim() };
      res = await fetch("/api/admin/add-youtube-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusyYt(false);
    if (!res.ok) {
      setUploadErr({ message: j.error || "Could not add YouTube link" });
      return;
    }
    setYtTitle("");
    setYtUrl("");
    setYtThumbUrl("");
    setYtTag("");
    setYtFile(null);
    setMsg("YouTube link added.");
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
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">Admin</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">Gallery uploads</h1>
            <p className="mt-1 text-sm text-slate-600">Signed in</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/modules" className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
              Director modules
            </Link>
            <Link href="/admin/the-future" className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-900">
              The Future
            </Link>
            <Link href="/admin/prompts" className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
              Workflows (Prompts)
            </Link>
            <Link href="/admin/outfits" className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800">
              Outfit Sheets
            </Link>
            <Link href="/admin/character-sheets" className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              Character Sheets
            </Link>
            <Link href="/admin/scenarios" className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800">
              Scenarios
            </Link>
            <Link href="/admin/locations" className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              Locations
            </Link>
            <Link href="/admin/props" className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              Props
            </Link>
            <Link href="/admin/lighting-presets" className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-800">
              Lighting
            </Link>
            <Link href="/admin/color-grades" className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800">
              Color Grades
            </Link>
            <Link href="/admin/mood-boards" className="rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-800">
              Mood Boards
            </Link>
            <Link href="/admin/industries" className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              Industries
            </Link>
            <Link href="/admin/sample-brands" className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
              Sample brands
            </Link>
            <Link href="/admin/workshops" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              Workshop bookings
            </Link>
            <Link href="/admin/avatars" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              Avatar images
            </Link>
            <Link href="/admin/manage" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              Manage uploaded items
            </Link>
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              View site
            </Link>
            <button type="button" onClick={signOut} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Sign out
            </button>
          </div>
        </header>

        {uploadErr ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p className="font-medium">{uploadErr.message}</p>
            {uploadErr.hint ? <p className="mt-2 text-xs leading-relaxed text-red-800">{uploadErr.hint}</p> : null}
          </div>
        ) : null}
        {msg ? <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">{msg}</p> : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">Images</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload a file to your S3 bucket (needs AWS keys in .env.local), or paste any public image URL.
          </p>
          <form onSubmit={uploadImage} className="mt-4 flex flex-col gap-3">
            <label className="block text-xs font-medium text-slate-700">
              Upload to S3
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Or image URL
              <input
                type="url"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://..."
                autoComplete="off"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-xs font-medium text-slate-700">
                Title
                <input
                  value={imgTitle}
                  onChange={(e) => setImgTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Display title"
                />
              </label>
              <label className="text-xs font-medium text-slate-700 sm:w-44">
                Category
                <select
                  value={imgCategory}
                  onChange={(e) => setImgCategory(e.target.value as FilmCategory)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-700 sm:w-40">
                Aspect
                <select
                  value={imgAspect}
                  onChange={(e) => setImgAspect(e.target.value as typeof imgAspect)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Auto</option>
                  <option value="square">Square</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>
              <div className="text-xs font-medium text-slate-700 sm:w-64">
                Characters
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2">
                  {CHARACTER_TAGS.map((name) => (
                    <label key={`img-${name}`} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={imgPeopleTags.includes(name)}
                        onChange={() => toggleTag(name, setImgPeopleTags)}
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={busyImage}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white enabled:hover:bg-slate-800 disabled:opacity-60 sm:self-end"
              >
                {busyImage ? "Saving..." : "Add image"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Prompt (optional)</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Only shows on the site if filled. This will appear under the new “Prompt” button in fullscreen.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">
                  {imgPrompt.trim() ? `${imgPrompt.trim().length} chars` : "Empty"}
                </p>
              </div>
              <textarea
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                className="mt-3 min-h-[180px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-[12px] leading-relaxed text-slate-900 shadow-inner shadow-slate-200/70 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Paste the generation prompt here…"
              />
            </div>
          </form>

          {pendingImgBlobUrl ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Selected file (before upload)</p>
              <div className="relative mt-2 max-h-56 w-full overflow-hidden rounded-lg bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingImgBlobUrl} alt="Pending upload" className="max-h-56 w-full object-contain" />
              </div>
            </div>
          ) : null}

          {lastSavedImage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">Just saved</p>
                  <p className="mt-1 font-heading text-lg font-bold text-slate-900">{lastSavedImage.title}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-600">{lastSavedImage.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(lastSavedImage.url)}
                  className="shrink-0 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900"
                >
                  Copy URL
                </button>
              </div>
              <div className="relative mt-3 max-h-72 w-full overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lastSavedImage.url} alt="" className="max-h-72 w-full object-contain" />
              </div>
              <button
                type="button"
                onClick={() => setLastSavedImage(null)}
                className="mt-3 text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
              >
                Dismiss preview
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">Films</h2>
          <p className="mt-1 text-sm text-slate-500">Upload a video file to S3, or paste a public video URL.</p>
          <form onSubmit={uploadFilm} className="mt-4 flex flex-col gap-3">
            <label className="block text-xs font-medium text-slate-700">
              Upload to S3
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFilmFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Or video URL
              <input
                type="url"
                value={filmUrl}
                onChange={(e) => setFilmUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://... (.mp4, etc.)"
                autoComplete="off"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-xs font-medium text-slate-700">
                Title
                <input
                  value={filmTitle}
                  onChange={(e) => setFilmTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Display title"
                />
              </label>
              <label className="text-xs font-medium text-slate-700 sm:w-44">
                Category
                <select
                  value={filmCategory}
                  onChange={(e) => setFilmCategory(e.target.value as FilmCategory)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-700 sm:w-40">
                Orientation
                <select
                  value={filmOrientation}
                  onChange={(e) => setFilmOrientation(e.target.value as typeof filmOrientation)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Auto</option>
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </label>
              <div className="text-xs font-medium text-slate-700 sm:w-64">
                Characters
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2">
                  {CHARACTER_TAGS.map((name) => (
                    <label key={`film-${name}`} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={filmPeopleTags.includes(name)}
                        onChange={() => toggleTag(name, setFilmPeopleTags)}
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={busyFilm}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white enabled:hover:bg-slate-800 disabled:opacity-60 sm:self-end"
              >
                {busyFilm ? "Saving..." : "Add film"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Prompt (optional)</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Only shows on the site if filled. This will appear under the new “Prompt” button in fullscreen.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">
                  {filmPrompt.trim() ? `${filmPrompt.trim().length} chars` : "Empty"}
                </p>
              </div>
              <textarea
                value={filmPrompt}
                onChange={(e) => setFilmPrompt(e.target.value)}
                className="mt-3 min-h-[180px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-[12px] leading-relaxed text-slate-900 shadow-inner shadow-slate-200/70 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="Paste the generation prompt here…"
              />
            </div>
          </form>

          {pendingFilmBlobUrl ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Selected file (before upload)</p>
              <video src={pendingFilmBlobUrl} className="mt-2 max-h-64 w-full rounded-lg bg-black" controls playsInline />
            </div>
          ) : null}

          {lastSavedFilm ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">Just saved</p>
                  <p className="mt-1 font-heading text-lg font-bold text-slate-900">{lastSavedFilm.title}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-600">{lastSavedFilm.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(lastSavedFilm.url)}
                  className="shrink-0 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900"
                >
                  Copy URL
                </button>
              </div>
              <video src={lastSavedFilm.url} className="mt-3 max-h-72 w-full rounded-lg bg-black" controls playsInline />
              <button
                type="button"
                onClick={() => setLastSavedFilm(null)}
                className="mt-3 text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
              >
                Dismiss preview
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">Instagram links</h2>
          <p className="mt-1 text-sm text-slate-500">Add links for Instagram page. Upload thumbnail to S3 or paste thumbnail URL.</p>
          <form onSubmit={addInstagramLink} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.1fr_1fr_1fr_0.8fr_auto]">
            <input
              value={igTitle}
              onChange={(e) => setIgTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Post title"
              required
            />
            <input
              type="url"
              value={igUrl}
              onChange={(e) => setIgUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://instagram.com/..."
              required
            />
            <input
              type="url"
              value={igThumbUrl}
              onChange={(e) => setIgThumbUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Optional thumbnail URL"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIgFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={igTag}
              onChange={(e) => setIgTag(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Tag (e.g. Morphers)"
            />
            <button
              type="submit"
              disabled={busyIg}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white enabled:hover:bg-slate-800 disabled:opacity-60"
            >
              {busyIg ? "Saving..." : "Add"}
            </button>
          </form>
          {pendingIgBlobUrl ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingIgBlobUrl} alt="Instagram thumbnail preview" className="h-32 w-48 rounded-lg object-cover" />
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold">YouTube links</h2>
          <p className="mt-1 text-sm text-slate-500">Add links for YouTube page. Upload thumbnail to S3 or paste thumbnail URL.</p>
          <form onSubmit={addYoutubeLink} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.1fr_1fr_1fr_0.8fr_auto]">
            <input
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Video title"
              required
            />
            <input
              type="url"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://youtube.com/watch?v=..."
              required
            />
            <input
              type="url"
              value={ytThumbUrl}
              onChange={(e) => setYtThumbUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Optional thumbnail URL"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setYtFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={ytTag}
              onChange={(e) => setYtTag(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Tag (e.g. Morphers)"
            />
            <button
              type="submit"
              disabled={busyYt}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white enabled:hover:bg-slate-800 disabled:opacity-60"
            >
              {busyYt ? "Saving..." : "Add"}
            </button>
          </form>
          {pendingYtBlobUrl ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingYtBlobUrl} alt="YouTube thumbnail preview" className="h-32 w-48 rounded-lg object-cover" />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
