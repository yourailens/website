"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHARACTER_TAGS, GALLERY_CATEGORY_TABS, type CharacterTag, type FilmCategory } from "@/data/gallery";
import OttCutsDesk from "./OttCutsDesk";

type SavedPreview = { url: string; title: string };

const CATEGORY_OPTIONS = GALLERY_CATEGORY_TABS.filter(
  (t): t is { id: FilmCategory; label: string } => t.id !== null
);

const FIELD =
  "mt-2 w-full border border-white/20 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 caret-white outline-none transition focus:border-white/55 [color-scheme:dark]";
const BTN =
  "bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100 disabled:opacity-40";
const PANEL = "border border-white/15 bg-black/45 p-6";

const ADMIN_CHANNELS: { scene: string; title: string; links: { href: string; label: string }[] }[] = [
  {
    scene: "01",
    title: "Studio",
    links: [
      { href: "/admin/team", label: "Team" },
      { href: "/admin/services", label: "Pricing" },
      { href: "/admin/workshops", label: "Workshops" },
      { href: "/admin/avatars", label: "Avatars" },
    ],
  },
  {
    scene: "02",
    title: "Libraries",
    links: [
      { href: "/admin/prompts", label: "Workflows" },
      { href: "/admin/outfits", label: "Outfits" },
      { href: "/admin/character-sheets", label: "Characters" },
      { href: "/admin/scenarios", label: "Scenarios" },
      { href: "/admin/locations", label: "Locations" },
      { href: "/admin/props", label: "Props" },
      { href: "/admin/lighting-presets", label: "Lighting" },
      { href: "/admin/color-grades", label: "Color" },
      { href: "/admin/mood-boards", label: "Mood boards" },
    ],
  },
  {
    scene: "03",
    title: "World",
    links: [
      { href: "/admin/industries", label: "Industries" },
      { href: "/admin/sample-brands", label: "Sample brands" },
      { href: "/admin/modules", label: "Modules" },
      { href: "/admin/the-future", label: "The Future" },
    ],
  },
  {
    scene: "04",
    title: "Desk",
    links: [{ href: "/admin/manage", label: "Manage uploads" }],
  },
];

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
      <main className="ott-home relative min-h-screen bg-black px-6 py-24 font-body text-white">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CONTROL ROOM</p>
          <h1 className="mt-3 font-heading text-3xl leading-none">Not authorized</h1>
          <p className="mt-3 text-sm text-white/70">Sign in to manage the studio desk.</p>
          <Link href="/admin/login" className={`mt-6 inline-flex ${BTN}`}>
            Go to admin login
          </Link>
        </div>
      </main>
    );
  }

  if (sessionOk === null) {
    return (
      <main className="ott-home relative min-h-screen bg-black px-6 py-24 font-body text-white">
        <div className="mx-auto max-w-lg text-center text-sm text-white/60">Loading desk…</div>
      </main>
    );
  }

  return (
    <main className="ott-home relative min-h-screen overflow-x-hidden bg-black px-5 py-10 font-body text-white sm:px-8 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 12% 0%, rgba(37,99,235,0.32), transparent 55%), radial-gradient(ellipse 40% 30% at 90% 0%, rgba(29,78,216,0.18), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CONTROL ROOM</p>
            <h1 className="mt-2 font-heading text-[clamp(2rem,5vw,3.4rem)] leading-none">Studio desk</h1>
            <p className="mt-2 text-sm text-white/70">Signed in. Add cuts for AI ads, films, and community.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:border-white">
              View site
            </Link>
            <button type="button" onClick={signOut} className={BTN}>
              Sign out
            </button>
          </div>
        </header>

        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_CHANNELS.map((ch) => (
            <div key={ch.scene} className="border border-white/15 bg-black/40 p-4">
              <p className="font-heading text-2xl leading-none text-blue-400">{ch.scene}</p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-white/45">{ch.title.toUpperCase()}</p>
              <ul className="mt-3 space-y-1.5">
                {ch.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/80 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <OttCutsDesk />

        <details className="border border-white/15 bg-black/30">
          <summary className="cursor-pointer px-5 py-4 text-sm text-white/70 hover:text-white">
            Classic gallery — images, films, Instagram, YouTube
          </summary>
          <div className="space-y-6 border-t border-white/10 px-5 pb-6 pt-5">
        {uploadErr ? (
          <div className="border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <p className="font-medium">{uploadErr.message}</p>
            {uploadErr.hint ? <p className="mt-2 text-xs leading-relaxed text-red-200/80">{uploadErr.hint}</p> : null}
          </div>
        ) : null}
        {msg ? <p className="border border-white/20 bg-white/[0.07] px-4 py-3 text-sm text-white/90">{msg}</p> : null}

        <section className={PANEL}>
          <h2 className="font-heading text-2xl leading-none">Images</h2>
          <p className="mt-2 text-sm text-white/60">
            Upload a file to your S3 bucket (needs AWS keys in .env.local), or paste any public image URL.
          </p>
          <form onSubmit={uploadImage} className="mt-4 flex flex-col gap-3">
            <label className="block text-xs font-medium text-white/70">
              Upload to S3
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:border-0 file:bg-[#fafafa] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
              />
            </label>
            <label className="block text-xs font-medium text-white/70">
              Or image URL
              <input
                type="url"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className={FIELD}
                placeholder="https://..."
                autoComplete="off"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-white/70 sm:col-span-2">
                Title
                <input
                  value={imgTitle}
                  onChange={(e) => setImgTitle(e.target.value)}
                  className={FIELD}
                  placeholder="Display title"
                />
              </label>
              <label className="text-xs font-medium text-white/70">
                Category
                <select
                  value={imgCategory}
                  onChange={(e) => setImgCategory(e.target.value as FilmCategory)}
                  className={FIELD}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-white/70">
                Aspect
                <select
                  value={imgAspect}
                  onChange={(e) => setImgAspect(e.target.value as typeof imgAspect)}
                  className={FIELD}
                >
                  <option value="">Auto</option>
                  <option value="square">Square</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>
              <div className="text-xs font-medium text-white/70 sm:col-span-2">
                Characters
                <div className="mt-2 grid grid-cols-2 gap-2 border border-white/20 bg-white/[0.05] p-2 sm:grid-cols-4">
                  {CHARACTER_TAGS.map((name) => (
                    <label key={`img-${name}`} className="flex items-center gap-2 text-xs text-white/80">
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
                className={`${BTN} sm:col-span-2 sm:justify-self-start`}
              >
                {busyImage ? "Saving..." : "Add image"}
              </button>
            </div>

            <div className="border border-white/15 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-white/90">Prompt (optional)</p>
                  <p className="mt-1 text-xs text-white/50">
                    Only shows on the site if filled. This will appear under the new “Prompt” button in fullscreen.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-white/45">
                  {imgPrompt.trim() ? `${imgPrompt.trim().length} chars` : "Empty"}
                </p>
              </div>
              <textarea
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                className={`${FIELD} min-h-[180px] resize-y font-mono text-[12px] leading-relaxed`}
                placeholder="Paste the generation prompt here…"
              />
            </div>
          </form>

          {pendingImgBlobUrl ? (
            <div className="mt-6 border border-dashed border-white/25 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/45">SELECTED FILE (BEFORE UPLOAD)</p>
              <div className="relative mt-2 max-h-56 w-full overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingImgBlobUrl} alt="Pending upload" className="max-h-56 w-full object-contain" />
              </div>
            </div>
          ) : null}

          {lastSavedImage ? (
            <div className="mt-6 border border-white/20 bg-blue-500/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-blue-300">JUST SAVED</p>
                  <p className="mt-1 font-heading text-lg text-white">{lastSavedImage.title}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-white/55">{lastSavedImage.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(lastSavedImage.url)}
                  className="shrink-0 border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:border-white"
                >
                  Copy URL
                </button>
              </div>
              <div className="relative mt-3 max-h-72 w-full overflow-hidden bg-black ring-1 ring-white/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lastSavedImage.url} alt="" className="max-h-72 w-full object-contain" />
              </div>
              <button
                type="button"
                onClick={() => setLastSavedImage(null)}
                className="mt-3 text-xs font-medium text-white/55 underline-offset-2 hover:underline"
              >
                Dismiss preview
              </button>
            </div>
          ) : null}
        </section>

        <section className={PANEL}>
          <h2 className="font-heading text-2xl leading-none">Films</h2>
          <p className="mt-2 text-sm text-white/60">Upload a video file to S3, or paste a public video URL.</p>
          <form onSubmit={uploadFilm} className="mt-4 flex flex-col gap-3">
            <label className="block text-xs font-medium text-white/70">
              Upload to S3
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFilmFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:border-0 file:bg-[#fafafa] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
              />
            </label>
            <label className="block text-xs font-medium text-white/70">
              Or video URL
              <input
                type="url"
                value={filmUrl}
                onChange={(e) => setFilmUrl(e.target.value)}
                className={FIELD}
                placeholder="https://... (.mp4, etc.)"
                autoComplete="off"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-white/70 sm:col-span-2">
                Title
                <input
                  value={filmTitle}
                  onChange={(e) => setFilmTitle(e.target.value)}
                  className={FIELD}
                  placeholder="Display title"
                />
              </label>
              <label className="text-xs font-medium text-white/70">
                Category
                <select
                  value={filmCategory}
                  onChange={(e) => setFilmCategory(e.target.value as FilmCategory)}
                  className={FIELD}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-white/70">
                Orientation
                <select
                  value={filmOrientation}
                  onChange={(e) => setFilmOrientation(e.target.value as typeof filmOrientation)}
                  className={FIELD}
                >
                  <option value="">Auto</option>
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </label>
              <div className="text-xs font-medium text-white/70 sm:col-span-2">
                Characters
                <div className="mt-2 grid grid-cols-2 gap-2 border border-white/20 bg-white/[0.05] p-2 sm:grid-cols-4">
                  {CHARACTER_TAGS.map((name) => (
                    <label key={`film-${name}`} className="flex items-center gap-2 text-xs text-white/80">
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
                className={`${BTN} sm:col-span-2 sm:justify-self-start`}
              >
                {busyFilm ? "Saving..." : "Add film"}
              </button>
            </div>

            <div className="border border-white/15 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-white/90">Prompt (optional)</p>
                  <p className="mt-1 text-xs text-white/50">
                    Only shows on the site if filled. This will appear under the new “Prompt” button in fullscreen.
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-white/45">
                  {filmPrompt.trim() ? `${filmPrompt.trim().length} chars` : "Empty"}
                </p>
              </div>
              <textarea
                value={filmPrompt}
                onChange={(e) => setFilmPrompt(e.target.value)}
                className={`${FIELD} min-h-[180px] resize-y font-mono text-[12px] leading-relaxed`}
                placeholder="Paste the generation prompt here…"
              />
            </div>
          </form>

          {pendingFilmBlobUrl ? (
            <div className="mt-6 border border-dashed border-white/25 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/45">SELECTED FILE (BEFORE UPLOAD)</p>
              <video
                src={pendingFilmBlobUrl}
                className="mt-2 max-h-64 w-full bg-black"
                controls
                playsInline
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
              />
            </div>
          ) : null}

          {lastSavedFilm ? (
            <div className="mt-6 border border-white/20 bg-blue-500/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-blue-300">JUST SAVED</p>
                  <p className="mt-1 font-heading text-lg text-white">{lastSavedFilm.title}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-white/55">{lastSavedFilm.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(lastSavedFilm.url)}
                  className="shrink-0 border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:border-white"
                >
                  Copy URL
                </button>
              </div>
              <video
                src={lastSavedFilm.url}
                className="mt-3 max-h-72 w-full bg-black"
                controls
                playsInline
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
              />
              <button
                type="button"
                onClick={() => setLastSavedFilm(null)}
                className="mt-3 text-xs font-medium text-white/55 underline-offset-2 hover:underline"
              >
                Dismiss preview
              </button>
            </div>
          ) : null}
        </section>

        <section className={PANEL}>
          <h2 className="font-heading text-2xl leading-none">Instagram links</h2>
          <p className="mt-2 text-sm text-white/60">Add links for Instagram page. Upload thumbnail to S3 or paste thumbnail URL.</p>
          <form onSubmit={addInstagramLink} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.1fr_1fr_1fr_0.8fr_auto]">
            <input
              value={igTitle}
              onChange={(e) => setIgTitle(e.target.value)}
              className={FIELD}
              placeholder="Post title"
              required
            />
            <input
              type="url"
              value={igUrl}
              onChange={(e) => setIgUrl(e.target.value)}
              className={FIELD}
              placeholder="https://instagram.com/..."
              required
            />
            <input
              type="url"
              value={igThumbUrl}
              onChange={(e) => setIgThumbUrl(e.target.value)}
              className={FIELD}
              placeholder="Optional thumbnail URL"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIgFile(e.target.files?.[0] ?? null)}
              className={FIELD}
            />
            <input
              value={igTag}
              onChange={(e) => setIgTag(e.target.value)}
              className={FIELD}
              placeholder="Tag (e.g. Morphers)"
            />
            <button
              type="submit"
              disabled={busyIg}
              className={BTN}
            >
              {busyIg ? "Saving..." : "Add"}
            </button>
          </form>
          {pendingIgBlobUrl ? (
            <div className="mt-4 border border-dashed border-white/25 bg-white/[0.03] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingIgBlobUrl} alt="Instagram thumbnail preview" className="h-32 w-48 object-cover" />
            </div>
          ) : null}
        </section>

        <section className={PANEL}>
          <h2 className="font-heading text-2xl leading-none">YouTube links</h2>
          <p className="mt-2 text-sm text-white/60">Add links for YouTube page. Upload thumbnail to S3 or paste thumbnail URL.</p>
          <form onSubmit={addYoutubeLink} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.1fr_1fr_1fr_0.8fr_auto]">
            <input
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
              className={FIELD}
              placeholder="Video title"
              required
            />
            <input
              type="url"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className={FIELD}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
            <input
              type="url"
              value={ytThumbUrl}
              onChange={(e) => setYtThumbUrl(e.target.value)}
              className={FIELD}
              placeholder="Optional thumbnail URL"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setYtFile(e.target.files?.[0] ?? null)}
              className={FIELD}
            />
            <input
              value={ytTag}
              onChange={(e) => setYtTag(e.target.value)}
              className={FIELD}
              placeholder="Tag (e.g. Morphers)"
            />
            <button
              type="submit"
              disabled={busyYt}
              className={BTN}
            >
              {busyYt ? "Saving..." : "Add"}
            </button>
          </form>
          {pendingYtBlobUrl ? (
            <div className="mt-4 border border-dashed border-white/25 bg-white/[0.03] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingYtBlobUrl} alt="YouTube thumbnail preview" className="h-32 w-48 object-cover" />
            </div>
          ) : null}
        </section>
          </div>
        </details>
      </div>
    </main>
  );
}
