"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import VaultPlayer from "@/components/vault/VaultPlayer";
import { SUMMIT_PATH } from "@/data/summit-posts";
import type { SummitFilm } from "@/lib/summit/load";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40 focus:bg-white/[0.09]";
const LABEL = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45";

async function uploadFile(file: File) {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/admin/summit/upload", { method: "POST", body: fd });
  const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
  return j.url;
}

export default function SummitDesk() {
  const [film, setFilm] = useState<SummitFilm | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/summit");
      const j = (await res.json().catch(() => ({}))) as { film?: SummitFilm; error?: string };
      if (cancelled) return;
      if (!res.ok) setErr(j.error || "Could not load the film");
      else setFilm(j.film ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(next: { video_url?: string | null; poster_url?: string | null }, note: string) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/summit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const j = (await res.json().catch(() => ({}))) as { film?: SummitFilm; error?: string };
      if (!res.ok || !j.film) throw new Error(j.error || "Could not save");
      setFilm(j.film);
      setMsg(note);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl text-white">
      <p className="max-w-xl text-sm leading-relaxed text-white/55">
        Upload the pavilion film. It plays on the studio player on the public page. There is no download control.
      </p>
      <Link href={SUMMIT_PATH} className="mt-4 inline-block text-sm text-kannada-gold underline underline-offset-4">
        Open the public page
      </Link>

      {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
      {msg ? <p className="mt-4 text-sm text-emerald-300">{msg}</p> : null}

      <section className="mt-8 rounded-[1.35rem] border border-white/12 bg-white/[0.04] p-5">
        <label className={LABEL}>
          Film file
          <input
            className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-kannada-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
            disabled={busy || !film}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              setErr("");
              uploadFile(file)
                .then((url) => save({ video_url: url }, "Film is on the page."))
                .catch((error: unknown) => {
                  setBusy(false);
                  setErr(error instanceof Error ? error.message : "Upload failed");
                });
            }}
          />
        </label>

        <label className={`${LABEL} mt-6`}>
          Poster, optional
          <input
            className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || !film}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              setErr("");
              uploadFile(file)
                .then((url) => save({ poster_url: url }, "Poster saved."))
                .catch((error: unknown) => {
                  setBusy(false);
                  setErr(error instanceof Error ? error.message : "Upload failed");
                });
            }}
          />
        </label>

        <label className={`${LABEL} mt-6`}>
          Or paste a video URL
          <input
            className={`${FIELD} mt-1.5`}
            value={film?.video_url ?? ""}
            placeholder="https://"
            disabled={!film}
            onChange={(e) => setFilm((prev) => (prev ? { ...prev, video_url: e.target.value } : prev))}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || !film}
            onClick={() => void save({ video_url: film?.video_url ?? null }, "Saved.")}
            className="rounded-full bg-kannada-gold px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
          >
            {busy ? "Working…" : "Save URL"}
          </button>
          <button
            type="button"
            disabled={busy || !film?.video_url}
            onClick={() => void save({ video_url: null }, "Film removed from the page.")}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 disabled:opacity-40"
          >
            Remove film
          </button>
        </div>
      </section>

      {film?.video_url ? (
        <div className="mt-8 overflow-hidden rounded-[4px] border border-white/10">
          <VaultPlayer src={film.video_url} poster={film.poster_url} title="Summit film preview" />
        </div>
      ) : null}
    </div>
  );
}
