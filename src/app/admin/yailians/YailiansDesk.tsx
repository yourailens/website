"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ottCutYoutubeId } from "@/data/ott-cuts";
import {
  YAILIANS_WORLD_KINDS,
  yailiansWorldKindLabel,
  type YailiansScreening,
  type YailiansSite,
  type YailiansVoice,
  type YailiansWorldItem,
  type YailiansWorldKind,
} from "@/data/yailians";

function youtubeThumb(url: string) {
  const id = ottCutYoutubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40 focus:bg-white/[0.09]";
const BUBBLE =
  "rounded-[1.35rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)] sm:p-5";
const LABEL = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45";
const CHIP =
  "rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70 disabled:opacity-40";

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Tab = "film" | "voices" | "screenings" | "world";

const EMPTY_SITE: YailiansSite = {
  id: 1,
  title: "YAILIANS",
  tagline: "Our first 45 min AI film.",
  synopsis: null,
  trailer_url: null,
  trailer_poster: null,
  hero_image_url: null,
  runtime_label: "45 min",
  updated_at: new Date().toISOString(),
};

async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/yailians/upload-media", { method: "POST", body: fd });
  const j = (await res.json().catch(() => ({}))) as {
    url?: string;
    media_type?: "image" | "video";
    poster_url?: string | null;
    error?: string;
  };
  if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
  return j;
}

export default function YailiansDesk() {
  const heroFileRef = useRef<HTMLInputElement>(null);
  const trailerFileRef = useRef<HTMLInputElement>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("film");
  const [site, setSite] = useState<YailiansSite>(EMPTY_SITE);
  const [voices, setVoices] = useState<YailiansVoice[]>([]);
  const [screenings, setScreenings] = useState<YailiansScreening[]>([]);
  const [world, setWorld] = useState<YailiansWorldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [siteRes, voicesRes, screeningsRes, worldRes] = await Promise.all([
      fetch("/api/admin/yailians/site"),
      fetch("/api/admin/yailians/voices"),
      fetch("/api/admin/yailians/screenings"),
      fetch("/api/admin/yailians/world"),
    ]);
    const siteJson = (await siteRes.json().catch(() => ({}))) as { site?: YailiansSite; error?: string };
    const voicesJson = (await voicesRes.json().catch(() => ({}))) as { voices?: YailiansVoice[]; error?: string };
    const screeningsJson = (await screeningsRes.json().catch(() => ({}))) as {
      screenings?: YailiansScreening[];
      error?: string;
    };
    const worldJson = (await worldRes.json().catch(() => ({}))) as {
      items?: YailiansWorldItem[];
      error?: string;
    };

    if (!siteRes.ok) {
      setErr(
        siteJson.error ||
          "Could not load YAILIANS. Run 085_yailians.sql and 086_yailians_hero.sql in Supabase."
      );
      setSite(EMPTY_SITE);
    } else {
      setErr("");
      setSite({ ...EMPTY_SITE, ...(siteJson.site ?? {}) });
    }
    setVoices(voicesJson.voices ?? []);
    setScreenings(screeningsJson.screenings ?? []);
    setWorld(worldJson.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const heroPreview =
    site.hero_image_url?.trim() ||
    site.trailer_poster?.trim() ||
    (site.trailer_url ? youtubeThumb(site.trailer_url) : null);

  const trailerYt = site.trailer_url ? ottCutYoutubeId(site.trailer_url) : null;

  async function saveSite() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/yailians/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      const j = (await res.json().catch(() => ({}))) as { site?: YailiansSite; error?: string };
      if (!res.ok) throw new Error(j.error || "Save failed");
      setSite({ ...EMPTY_SITE, ...(j.site ?? site) });
      setMsg("Film settings saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onHeroFile(file: File) {
    setBusy(true);
    setErr("");
    try {
      const up = await uploadFile(file);
      setSite((s) => ({ ...s, hero_image_url: up.url! }));
      setMsg("Hero uploaded — click Save.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center gap-2.5">
        {(
          [
            { id: "film" as const, label: "Film & hero" },
            { id: "voices" as const, label: "Interviews" },
            { id: "screenings" as const, label: "Screenings" },
            { id: "world" as const, label: "World gallery" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2.5 text-[12px] font-semibold transition ${
              tab === item.id
                ? "bg-white text-black"
                : "border border-white/15 bg-white/[0.04] text-white/65 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
        <Link
          href="/yailians"
          className="ml-auto rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/40 hover:text-white"
        >
          View YAILIANS
        </Link>
      </div>

      {err ? <p className="text-sm text-rose-300/90">{err}</p> : null}
      {msg ? <p className="text-sm text-emerald-300/90">{msg}</p> : null}
      {loading ? <p className="text-sm text-white/40">Loading desk…</p> : null}

      {tab === "film" ? (
        <section className={BUBBLE}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-emerald-300/80">YAILIANS</p>
              <h2 className="mt-1.5 font-heading text-2xl leading-none tracking-tight">Film & hero</h2>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/50">
                Landscape hero still for the hub, copy, and trailer. Preview updates as you edit.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            {/* Form */}
            <div className="space-y-4">
              <div>
                <span className={LABEL}>Hub hero · landscape 16:9</span>
                <input
                  className={FIELD}
                  value={site.hero_image_url ?? ""}
                  onChange={(e) => setSite({ ...site, hero_image_url: e.target.value })}
                  placeholder="https://… or upload below"
                />
                <input
                  ref={heroFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onHeroFile(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => heroFileRef.current?.click()}
                  className="mt-2 w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-3 text-sm font-semibold text-white/80 transition hover:border-emerald-300/50 hover:text-white disabled:opacity-40"
                >
                  Upload hero image · landscape
                </button>
              </div>

              <label className="block">
                <span className={LABEL}>Title</span>
                <input
                  className={FIELD}
                  value={site.title}
                  onChange={(e) => setSite({ ...site, title: e.target.value })}
                />
              </label>
              <label className="block">
                <span className={LABEL}>Tagline</span>
                <input
                  className={FIELD}
                  value={site.tagline ?? ""}
                  onChange={(e) => setSite({ ...site, tagline: e.target.value })}
                />
              </label>
              <label className="block">
                <span className={LABEL}>Runtime</span>
                <input
                  className={FIELD}
                  value={site.runtime_label ?? ""}
                  onChange={(e) => setSite({ ...site, runtime_label: e.target.value })}
                  placeholder="45 min"
                />
              </label>
              <label className="block">
                <span className={LABEL}>Synopsis</span>
                <textarea
                  className={`${FIELD} min-h-[7rem] resize-y`}
                  value={site.synopsis ?? ""}
                  onChange={(e) => setSite({ ...site, synopsis: e.target.value })}
                />
              </label>

              <label className="block">
                <span className={LABEL}>Trailer URL (YouTube or file)</span>
                <input
                  className={FIELD}
                  value={site.trailer_url ?? ""}
                  onChange={(e) => {
                    const trailer_url = e.target.value;
                    const ytPoster = youtubeThumb(trailer_url);
                    setSite({
                      ...site,
                      trailer_url,
                      trailer_poster:
                        ytPoster &&
                        (!site.trailer_poster || /i\.ytimg\.com\/vi\//.test(site.trailer_poster))
                          ? ytPoster
                          : site.trailer_poster,
                    });
                  }}
                  placeholder="https://youtube.com/watch?v=…"
                />
                <input
                  ref={trailerFileRef}
                  type="file"
                  accept="video/*,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void (async () => {
                      setBusy(true);
                      try {
                        const up = await uploadFile(file);
                        setSite((s) => ({
                          ...s,
                          trailer_url: up.url!,
                          trailer_poster: up.poster_url ?? s.trailer_poster,
                        }));
                        setMsg("Trailer media uploaded — click Save.");
                      } catch (er) {
                        setErr(er instanceof Error ? er.message : "Upload failed");
                      } finally {
                        setBusy(false);
                      }
                    })();
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => trailerFileRef.current?.click()}
                  className="mt-2 w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-3 text-sm font-semibold text-white/80 transition hover:border-sky-300/50 hover:text-white disabled:opacity-40"
                >
                  Upload trailer file
                </button>
              </label>

              <label className="block">
                <span className={LABEL}>Trailer poster</span>
                <input
                  className={FIELD}
                  value={site.trailer_poster ?? ""}
                  onChange={(e) => setSite({ ...site, trailer_poster: e.target.value })}
                />
                <input
                  ref={posterFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void (async () => {
                      setBusy(true);
                      try {
                        const up = await uploadFile(file);
                        setSite((s) => ({ ...s, trailer_poster: up.url! }));
                        setMsg("Poster uploaded — click Save.");
                      } catch (er) {
                        setErr(er instanceof Error ? er.message : "Upload failed");
                      } finally {
                        setBusy(false);
                      }
                    })();
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => posterFileRef.current?.click()}
                  className="mt-2 w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-40"
                >
                  Upload trailer poster
                </button>
              </label>

              <button
                type="button"
                disabled={busy}
                onClick={() => void saveSite()}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-100 disabled:opacity-40"
              >
                {busy ? "Saving…" : "Save film settings"}
              </button>
            </div>

            {/* Live preview — vault style */}
            <div className="space-y-4">
              <div>
                <p className={LABEL}>Hub hero preview</p>
                <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-white/12 bg-black/60">
                  {heroPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[12rem] items-center justify-center px-6 text-center text-sm text-white/40">
                      Upload a landscape hero to preview
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-mono text-[8px] tracking-[0.28em] text-emerald-300/90">
                      YAIL ORIGINAL
                      {site.runtime_label ? ` · ${site.runtime_label.toUpperCase()}` : ""}
                    </p>
                    <p className="mt-1 font-heading text-[clamp(1.8rem,4vw,2.8rem)] leading-none tracking-tight">
                      {site.title || "YAILIANS"}
                    </p>
                    {site.tagline ? (
                      <p className="mt-2 line-clamp-2 text-xs text-white/65">{site.tagline}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className={LABEL}>Trailer preview</p>
                <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-white/12 bg-black/60">
                  {trailerYt ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerYt}?rel=0&modestbranding=1`}
                      title="Trailer preview"
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : site.trailer_url && !trailerYt ? (
                    <video
                      src={site.trailer_url}
                      poster={site.trailer_poster ?? undefined}
                      className="absolute inset-0 h-full w-full object-contain"
                      controls
                      muted
                      playsInline
                    />
                  ) : site.trailer_poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={site.trailer_poster}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[10rem] items-center justify-center px-6 text-center text-sm text-white/40">
                      Add a YouTube URL or upload a trailer
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "voices" ? (
        <VoicesPanel
          voices={voices}
          busy={busy}
          setBusy={setBusy}
          setErr={setErr}
          setMsg={setMsg}
          onChange={setVoices}
        />
      ) : null}

      {tab === "screenings" ? (
        <ScreeningsPanel
          screenings={screenings}
          busy={busy}
          setBusy={setBusy}
          setErr={setErr}
          setMsg={setMsg}
          onChange={setScreenings}
        />
      ) : null}

      {tab === "world" ? (
        <WorldPanel
          items={world}
          busy={busy}
          setBusy={setBusy}
          setErr={setErr}
          setMsg={setMsg}
          onChange={setWorld}
        />
      ) : null}
    </div>
  );
}

function VoicesPanel({
  voices,
  busy,
  setBusy,
  setErr,
  setMsg,
  onChange,
}: {
  voices: YailiansVoice[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setErr: (v: string) => void;
  setMsg: (v: string) => void;
  onChange: (v: YailiansVoice[]) => void;
}) {
  const videoRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<HTMLInputElement>(null);
  const emptyDraft = {
    name: "",
    role: "",
    quote: "",
    video_url: "",
    poster_url: "",
    portrait_url: "",
    featured_on_hub: true,
    published: true,
  };
  const [draft, setDraft] = useState(emptyDraft);
  const previewThumb = draft.poster_url || draft.portrait_url;

  async function create() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/yailians/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await res.json().catch(() => ({}))) as { voices?: YailiansVoice[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Create failed");
      onChange(j.voices ?? []);
      setDraft(emptyDraft);
      setMsg("Interview added.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/yailians/voices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { voices?: YailiansVoice[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Update failed");
      onChange(j.voices ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= voices.length || busy) return;
    const ordered = [...voices];
    const [item] = ordered.splice(index, 1);
    if (!item) return;
    ordered.splice(next, 0, item);
    const ranked = ordered.map((voice, i) => ({ ...voice, sort_order: ordered.length - i }));
    onChange(ranked);
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await Promise.all(
        ranked
          .filter((voice) => voices.find((current) => current.id === voice.id)?.sort_order !== voice.sort_order)
          .map(async (voice) => {
            const res = await fetch(`/api/admin/yailians/voices/${voice.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sort_order: voice.sort_order }),
            });
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) throw new Error(j.error || "Reorder failed");
          }),
      );
      const res = await fetch("/api/admin/yailians/voices");
      const j = (await res.json().catch(() => ({}))) as { voices?: YailiansVoice[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Reorder failed");
      onChange(j.voices ?? ranked);
      setMsg("Order saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reorder failed");
      onChange(voices);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this interview?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/yailians/voices/${id}`, { method: "DELETE" });
      const j = (await res.json().catch(() => ({}))) as { voices?: YailiansVoice[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Delete failed");
      onChange(j.voices ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className={BUBBLE}>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-emerald-300/80">Voices</p>
          <h2 className="mt-1.5 font-heading text-2xl tracking-tight">Add an interview</h2>
          <p className="mt-2 text-sm text-white/50">
            Upload the recorded interview video. Name + video required; quote optional.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={FIELD}
                placeholder="Name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <input
                className={FIELD}
                placeholder="Role / credit"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              />
            </div>
            <textarea
              className={`${FIELD} min-h-20`}
              placeholder="Optional pull-quote"
              value={draft.quote}
              onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
            />
            <input
              className={FIELD}
              placeholder="Interview video URL"
              value={draft.video_url}
              onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
            />
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadFile(file)
                  .then((up) =>
                    setDraft((d) => ({
                      ...d,
                      video_url: up.url!,
                      poster_url: up.poster_url || d.poster_url,
                    }))
                  )
                  .catch((er) => setErr(String(er.message || er)));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              className="w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-3 text-sm font-semibold text-white/80 transition hover:border-emerald-300/50 hover:text-white"
            >
              Upload interview video
            </button>
            <input
              className={FIELD}
              placeholder="Poster / thumbnail URL (optional)"
              value={draft.poster_url}
              onChange={(e) => setDraft({ ...draft, poster_url: e.target.value })}
            />
            <input
              ref={posterRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadFile(file)
                  .then((up) => setDraft((d) => ({ ...d, poster_url: up.url! })))
                  .catch((er) => setErr(String(er.message || er)));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => posterRef.current?.click()}
              className="w-full rounded-full border border-dashed border-white/20 bg-white/[0.03] py-2.5 text-sm text-white/70"
            >
              Upload poster image
            </button>
            <input
              className={FIELD}
              placeholder="Portrait URL (optional)"
              value={draft.portrait_url}
              onChange={(e) => setDraft({ ...draft, portrait_url: e.target.value })}
            />
            <input
              ref={portraitRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadFile(file)
                  .then((up) => setDraft((d) => ({ ...d, portrait_url: up.url! })))
                  .catch((er) => setErr(String(er.message || er)));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => portraitRef.current?.click()}
              className="w-full rounded-full border border-dashed border-white/20 bg-white/[0.03] py-2.5 text-sm text-white/70"
            >
              Upload portrait (optional)
            </button>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={draft.featured_on_hub}
                onChange={(e) => setDraft({ ...draft, featured_on_hub: e.target.checked })}
              />
              Hub promo
            </label>
            <button
              type="button"
              disabled={busy || !draft.name.trim() || !draft.video_url.trim()}
              onClick={() => void create()}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              Add interview
            </button>
          </div>

          <div className="overflow-hidden rounded-[1.25rem] border border-white/12 bg-black/60">
            <div className="relative aspect-video bg-zinc-950">
              {previewThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewThumb} alt="" className="h-full w-full object-cover" />
              ) : draft.video_url ? (
                <video
                  src={draft.video_url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/35">
                  Interview preview
                </div>
              )}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/90">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden>
                    <path d="M8 5.5v13l11-6.5-11-6.5z" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="p-5">
              <p className="font-semibold text-white">{draft.name || "Name"}</p>
              <p className="text-xs text-white/40">{draft.role || "Role"}</p>
              {draft.quote ? (
                <p className="mt-3 line-clamp-3 text-sm text-white/65">“{draft.quote}”</p>
              ) : (
                <p className="mt-3 text-sm text-white/35">Optional quote preview</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div>
        <h2 className="font-heading text-xl tracking-tight">Order</h2>
        <p className="mt-1 text-sm text-white/45">
          Move an interview up or down. Higher in this list plays first. The YAILIANS page shows the first four that are live.
        </p>
      </div>
      <ul className="space-y-3">
        {voices.map((v, index) => {
          const thumb = v.poster_url || v.portrait_url;
          return (
            <li key={v.id} className={`${BUBBLE} flex flex-wrap items-start gap-4`}>
              <div className="h-20 w-36 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : v.video_url ? (
                  <video
                    src={v.video_url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{v.name}</p>
                <p className="text-xs text-white/40">{v.role || "—"}</p>
                {v.quote ? <p className="mt-2 line-clamp-2 text-sm text-white/70">“{v.quote}”</p> : null}
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                  {v.video_url ? "Video ready" : "Missing video"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void move(index, -1)}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70 disabled:opacity-30"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={busy || index === voices.length - 1}
                  onClick={() => void move(index, 1)}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70 disabled:opacity-30"
                >
                  Down
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch(v.id, { featured_on_hub: !v.featured_on_hub })}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70"
                >
                  {v.featured_on_hub ? "Hub ✓" : "Hub"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch(v.id, { published: !v.published })}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70"
                >
                  {v.published ? "Live" : "Draft"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(v.id)}
                  className="rounded-full border border-rose-400/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-rose-200/80"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ScreeningsPanel({
  screenings,
  busy,
  setBusy,
  setErr,
  setMsg,
  onChange,
}: {
  screenings: YailiansScreening[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setErr: (v: string) => void;
  setMsg: (v: string) => void;
  onChange: (v: YailiansScreening[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const emptyScreening = {
    title: "",
    venue: "",
    city: "",
    starts_at: "",
    status: "upcoming" as "upcoming" | "past",
    notes: "",
    cover_url: "",
    ticket_url: "",
    featured_on_hub: true,
    published: true,
  };
  const [draft, setDraft] = useState(emptyScreening);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(emptyScreening);

  async function create() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/yailians/screenings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        screenings?: YailiansScreening[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Create failed");
      onChange(j.screenings ?? []);
      setDraft(emptyScreening);
      setMsg("Screening added.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/yailians/screenings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as {
        screenings?: YailiansScreening[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Update failed");
      onChange(j.screenings ?? []);
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(s: YailiansScreening) {
    setEditingId(s.id);
    setEdit({
      title: s.title,
      venue: s.venue ?? "",
      city: s.city ?? "",
      starts_at: toLocalInput(s.starts_at),
      status: s.status,
      notes: s.notes ?? "",
      cover_url: s.cover_url ?? "",
      ticket_url: s.ticket_url ?? "",
      featured_on_hub: s.featured_on_hub,
      published: s.published,
    });
  }

  async function saveEdit() {
    if (!editingId || !edit.title.trim()) return;
    const ok = await patch(editingId, {
      title: edit.title,
      status: edit.status,
      venue: edit.venue,
      city: edit.city,
      notes: edit.notes,
      cover_url: edit.cover_url,
      ticket_url: edit.ticket_url,
      starts_at: edit.starts_at ? new Date(edit.starts_at).toISOString() : null,
    });
    if (ok) {
      setMsg("Screening updated.");
      setEditingId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this screening?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/yailians/screenings/${id}`, { method: "DELETE" });
      const j = (await res.json().catch(() => ({}))) as {
        screenings?: YailiansScreening[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Delete failed");
      onChange(j.screenings ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className={BUBBLE}>
        <h2 className="font-heading text-xl tracking-tight">Add a screening</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={FIELD} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <select className={FIELD} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as "upcoming" | "past" })}>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past / finished</option>
              </select>
              <input className={FIELD} placeholder="Venue" value={draft.venue} onChange={(e) => setDraft({ ...draft, venue: e.target.value })} />
              <input className={FIELD} placeholder="City" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
              <input className={FIELD} type="datetime-local" value={draft.starts_at} onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })} />
              <input className={FIELD} placeholder="Ticket URL" value={draft.ticket_url} onChange={(e) => setDraft({ ...draft, ticket_url: e.target.value })} />
            </div>
            <textarea className={`${FIELD} min-h-20`} placeholder="Notes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            <input className={FIELD} placeholder="Cover URL" value={draft.cover_url} onChange={(e) => setDraft({ ...draft, cover_url: e.target.value })} />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadFile(file)
                  .then((up) => setDraft((d) => ({ ...d, cover_url: up.url! })))
                  .catch((er) => setErr(String(er.message || er)));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-3 text-sm font-semibold text-white/80"
            >
              Upload cover
            </button>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={draft.featured_on_hub} onChange={(e) => setDraft({ ...draft, featured_on_hub: e.target.checked })} />
              Hub promo
            </label>
            <button type="button" disabled={busy} onClick={() => void create()} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50">
              Add screening
            </button>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-white/12 bg-black/60">
            {draft.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/40">Cover preview</div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-300/80">{draft.status}</p>
              <p className="mt-1 font-semibold text-white">{draft.title || "Screening title"}</p>
            </div>
          </div>
        </div>
      </section>

      <ul className="space-y-3">
        {screenings.map((s) => {
          const open = editingId === s.id;
          return (
            <li key={s.id} className={BUBBLE}>
              <div className="flex flex-wrap items-start gap-4">
                <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                  {s.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-300/80">{s.status}</p>
                  <p className="mt-1 font-semibold text-white">{s.title}</p>
                  <p className="text-sm text-white/50">{[s.venue, s.city].filter(Boolean).join(" · ") || "—"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => (open ? setEditingId(null) : beginEdit(s))} className={CHIP}>
                    {open ? "Close" : "Edit"}
                  </button>
                  <button type="button" disabled={busy} onClick={() => void patch(s.id, { featured_on_hub: !s.featured_on_hub })} className={CHIP}>
                    {s.featured_on_hub ? "Hub ✓" : "Hub"}
                  </button>
                  <button type="button" disabled={busy} onClick={() => void patch(s.id, { published: !s.published })} className={CHIP}>
                    {s.published ? "Live" : "Draft"}
                  </button>
                  <button type="button" disabled={busy} onClick={() => void remove(s.id)} className="rounded-full border border-rose-400/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-rose-200/80">
                    Delete
                  </button>
                </div>
              </div>
              {open ? (
                <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className={FIELD} placeholder="Title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                    <select className={FIELD} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as "upcoming" | "past" })}>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past / finished</option>
                    </select>
                    <input className={FIELD} placeholder="Venue" value={edit.venue} onChange={(e) => setEdit({ ...edit, venue: e.target.value })} />
                    <input className={FIELD} placeholder="City" value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} />
                    <input className={FIELD} type="datetime-local" value={edit.starts_at} onChange={(e) => setEdit({ ...edit, starts_at: e.target.value })} />
                    <input className={FIELD} placeholder="Ticket URL" value={edit.ticket_url} onChange={(e) => setEdit({ ...edit, ticket_url: e.target.value })} />
                  </div>
                  <textarea className={`${FIELD} min-h-20`} placeholder="Notes" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
                  <input className={FIELD} placeholder="Cover URL" value={edit.cover_url} onChange={(e) => setEdit({ ...edit, cover_url: e.target.value })} />
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      void uploadFile(file)
                        .then((up) => setEdit((d) => ({ ...d, cover_url: up.url! })))
                        .catch((er) => setErr(String(er.message || er)));
                      e.target.value = "";
                    }}
                  />
                  <button type="button" onClick={() => editFileRef.current?.click()} className="w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-2.5 text-sm text-white/75">
                    Replace cover
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy || !edit.title.trim()} onClick={() => void saveEdit()} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
                      Save screening
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className={CHIP}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WorldPanel({
  items,
  busy,
  setBusy,
  setErr,
  setMsg,
  onChange,
}: {
  items: YailiansWorldItem[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setErr: (v: string) => void;
  setMsg: (v: string) => void;
  onChange: (v: YailiansWorldItem[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const emptyWorld = {
    title: "",
    caption: "",
    kind: "character" as YailiansWorldKind,
    media_type: "image" as "image" | "video",
    media_url: "",
    poster_url: "",
    featured_on_hub: true,
    published: true,
  };
  const [draft, setDraft] = useState(emptyWorld);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(emptyWorld);

  const grouped = useMemo(() => {
    const map = new Map<YailiansWorldKind, YailiansWorldItem[]>();
    for (const k of YAILIANS_WORLD_KINDS) map.set(k, []);
    for (const item of items) map.get(item.kind)?.push(item);
    return map;
  }, [items]);

  const draftThumb = draft.poster_url || (draft.media_type === "image" ? draft.media_url : "");

  async function create() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/yailians/world", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await res.json().catch(() => ({}))) as { items?: YailiansWorldItem[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Create failed");
      onChange(j.items ?? []);
      setDraft(emptyWorld);
      setMsg("World piece added.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/yailians/world/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { items?: YailiansWorldItem[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Update failed");
      onChange(j.items ?? []);
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(item: YailiansWorldItem) {
    setEditingId(item.id);
    setEdit({
      title: item.title,
      caption: item.caption ?? "",
      kind: item.kind,
      media_type: item.media_type,
      media_url: item.media_url,
      poster_url: item.poster_url ?? "",
      featured_on_hub: item.featured_on_hub,
      published: item.published,
    });
  }

  async function saveEdit() {
    if (!editingId || !edit.title.trim() || !edit.media_url.trim()) return;
    const ok = await patch(editingId, {
      title: edit.title,
      kind: edit.kind,
      caption: edit.caption,
      media_type: edit.media_type,
      media_url: edit.media_url,
      poster_url: edit.poster_url,
    });
    if (ok) {
      setMsg("World piece updated.");
      setEditingId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this world piece?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/yailians/world/${id}`, { method: "DELETE" });
      const j = (await res.json().catch(() => ({}))) as { items?: YailiansWorldItem[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Delete failed");
      onChange(j.items ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className={BUBBLE}>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-emerald-300/80">World gallery</p>
          <h2 className="mt-1.5 font-heading text-2xl tracking-tight">Add a piece</h2>
          <p className="mt-2 text-sm text-white/50">Characters, creatures, worlds, craft — with live preview.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={FIELD} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <select className={FIELD} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as YailiansWorldKind })}>
                {YAILIANS_WORLD_KINDS.map((k) => (
                  <option key={k} value={k}>{yailiansWorldKindLabel(k)}</option>
                ))}
              </select>
            </div>
            <textarea className={`${FIELD} min-h-20`} placeholder="Caption" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
            <input className={FIELD} placeholder="Media URL" value={draft.media_url} onChange={(e) => setDraft({ ...draft, media_url: e.target.value })} />
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadFile(file)
                  .then((up) =>
                    setDraft((d) => ({
                      ...d,
                      media_url: up.url!,
                      media_type: up.media_type ?? "image",
                      poster_url: up.poster_url ?? d.poster_url,
                    }))
                  )
                  .catch((er) => setErr(String(er.message || er)));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-3 text-sm font-semibold text-white/80 transition hover:border-emerald-300/50 hover:text-white"
            >
              Upload image or video
            </button>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={draft.featured_on_hub} onChange={(e) => setDraft({ ...draft, featured_on_hub: e.target.checked })} />
              Hub promo
            </label>
            <button type="button" disabled={busy || !draft.media_url || !draft.title} onClick={() => void create()} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50">
              Publish to world
            </button>
          </div>

          <div className="relative flex min-h-[14rem] max-h-[min(70vh,28rem)] items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/12 bg-black/60">
            {draft.media_type === "video" && draft.media_url ? (
              <video
                src={draft.media_url}
                poster={draft.poster_url || undefined}
                className="max-h-[min(70vh,28rem)] max-w-full object-contain"
                muted
                playsInline
                controls
              />
            ) : draftThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draftThumb} alt="" className="max-h-[min(70vh,28rem)] max-w-full object-contain" />
            ) : (
              <p className="px-6 text-center text-sm text-white/40">Preview lands here after upload</p>
            )}
          </div>
        </div>
      </section>

      {YAILIANS_WORLD_KINDS.map((kind) => {
        const list = grouped.get(kind) ?? [];
        if (!list.length) return null;
        return (
          <section key={kind} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                {yailiansWorldKindLabel(kind)}
              </h3>
              <span className="text-xs text-white/30">{list.length}</span>
            </div>
            <ul className="space-y-3">
              {list.map((item) => {
                const open = editingId === item.id;
                const thumb = item.poster_url || item.media_url;
                const editThumb = edit.poster_url || (edit.media_type === "image" ? edit.media_url : "");
                return (
                  <li key={item.id} className={`${BUBBLE} !p-3 sm:!p-4`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                      <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-black/50 lg:h-32 lg:w-52">
                        {item.media_type === "video" ? (
                          <video
                            src={item.media_url}
                            poster={item.poster_url ?? undefined}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        )}
                        <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80">
                          {item.media_type}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-300/70">
                          {yailiansWorldKindLabel(item.kind)}
                        </p>
                        <p className="font-semibold text-white">{item.title}</p>
                        {item.caption ? <p className="text-sm text-white/50">{item.caption}</p> : null}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button type="button" disabled={busy} onClick={() => (open ? setEditingId(null) : beginEdit(item))} className={CHIP}>
                            {open ? "Close" : "Edit"}
                          </button>
                          <button type="button" disabled={busy} onClick={() => void patch(item.id, { featured_on_hub: !item.featured_on_hub })} className={CHIP}>
                            {item.featured_on_hub ? "Hub ✓" : "Hub"}
                          </button>
                          <button type="button" disabled={busy} onClick={() => void patch(item.id, { published: !item.published })} className={CHIP}>
                            {item.published ? "Live" : "Draft"}
                          </button>
                          <button type="button" disabled={busy} onClick={() => void remove(item.id)} className="rounded-full border border-rose-400/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-rose-200/80">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    {open ? (
                      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className={FIELD} placeholder="Title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                          <select className={FIELD} value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value as YailiansWorldKind })}>
                            {YAILIANS_WORLD_KINDS.map((k) => (
                              <option key={k} value={k}>{yailiansWorldKindLabel(k)}</option>
                            ))}
                          </select>
                          <select className={FIELD} value={edit.media_type} onChange={(e) => setEdit({ ...edit, media_type: e.target.value as "image" | "video" })}>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                        <textarea className={`${FIELD} min-h-20`} placeholder="Caption" value={edit.caption} onChange={(e) => setEdit({ ...edit, caption: e.target.value })} />
                        <input className={FIELD} placeholder="Media URL" value={edit.media_url} onChange={(e) => setEdit({ ...edit, media_url: e.target.value })} />
                        <input className={FIELD} placeholder="Poster URL" value={edit.poster_url} onChange={(e) => setEdit({ ...edit, poster_url: e.target.value })} />
                        <input
                          ref={editFileRef}
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void uploadFile(file)
                              .then((up) =>
                                setEdit((d) => ({
                                  ...d,
                                  media_url: up.url!,
                                  media_type: up.media_type ?? "image",
                                  poster_url: up.poster_url ?? d.poster_url,
                                }))
                              )
                              .catch((er) => setErr(String(er.message || er)));
                            e.target.value = "";
                          }}
                        />
                        <button type="button" onClick={() => editFileRef.current?.click()} className="w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-2.5 text-sm text-white/75">
                          Replace image or video
                        </button>
                        {edit.media_type === "video" && edit.media_url ? (
                          <video src={edit.media_url} poster={edit.poster_url || undefined} className="max-h-64 w-full rounded-xl bg-black object-contain" muted playsInline controls />
                        ) : editThumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={editThumb} alt="" className="max-h-64 w-full rounded-xl bg-black object-contain" />
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <button type="button" disabled={busy || !edit.title.trim() || !edit.media_url.trim()} onClick={() => void saveEdit()} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
                            Save piece
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className={CHIP}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
