"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { PlannerNote } from "@/data/planner";
import PlannerMore from "@/components/planner/PlannerMore";
import {
  P_BTN,
  P_BUBBLE,
  P_FIELD,
  P_KICKER,
  P_PAGE,
} from "@/components/planner/planner-ui";
import { type PastedImage, usePasteImages } from "@/components/planner/usePasteImages";

export default function PlannerNotePage() {
  const params = useParams<{ slug: string; noteId: string }>();
  const [note, setNote] = useState<PlannerNote | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<PastedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/planner/notes/${params.noteId}`);
    if (res.status === 401) {
      window.location.href = "/planner/login";
      return;
    }
    const j = (await res.json().catch(() => ({}))) as { note?: PlannerNote; error?: string };
    if (!res.ok || !j.note) {
      setErr(j.error || "Not found");
      setLoaded(true);
      return;
    }
    setNote(j.note);
    setTitle(j.note.title);
    setBody(j.note.body);
    setImages(j.note.images.map((i) => ({ url: i.url, label: i.label ?? "" })));
    setLoaded(true);
  }, [params.noteId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPaste = usePasteImages(images, setImages, setErr);

  async function save() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/planner/notes/${params.noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, images }),
      });
      const j = (await res.json().catch(() => ({}))) as { note?: PlannerNote; error?: string };
      if (!res.ok) throw new Error(j.error || "Save failed");
      if (j.note) setNote(j.note);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this note page?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/notes/${params.noteId}`, { method: "DELETE" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Delete failed");
      }
      window.location.href = `/planner/people/${params.slug}`;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
      setBusy(false);
    }
  }

  if (!loaded) {
    return <div className={P_PAGE}><p className="text-sm text-white/40">Loading…</p></div>;
  }
  if (!note) {
    return <div className={P_PAGE}><p className="text-sm text-rose-300">{err || "Not found"}</p></div>;
  }

  return (
    <div className={P_PAGE}>
      <Link
        href={`/planner/people/${params.slug}`}
        className="text-[15px] text-[#1d9bf0] hover:underline"
      >
        Back to person
      </Link>
      <section className={P_BUBBLE}>
        <div className="flex items-center justify-between">
          <p className={P_KICKER}>Note page</p>
          <PlannerMore label="Delete" disabled={busy} onSelect={() => void remove()} />
        </div>
        <input
          className={`${P_FIELD} mt-3 font-heading text-xl`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={`${P_FIELD} mt-3 min-h-[16rem]`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onPaste={(e) => void onPaste(e)}
          placeholder="Type notes… paste screenshots anytime"
        />
        {images.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {images.map((img, i) => (
              <li key={`${img.url}-${i}`} className="overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full object-cover" />
                <input
                  className={`${P_FIELD} rounded-none border-0 border-t`}
                  placeholder="Why is this here?"
                  value={img.label}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = { ...img, label: e.target.value };
                    setImages(next);
                  }}
                />
                <button
                  type="button"
                  className="w-full py-2 text-[11px] uppercase tracking-[0.14em] text-rose-300/80"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                >
                  Remove image
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {err ? <p className="mt-3 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void save()} className={P_BTN}>
            Save
          </button>
        </div>
      </section>
    </div>
  );
}
