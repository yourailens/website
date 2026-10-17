"use client";

import Link from "next/link";
import { useState } from "react";
import type { PlannerMember, PlannerNote } from "@/data/planner";
import PlannerMore from "@/components/planner/PlannerMore";
import {
  P_BTN,
  P_BUBBLE,
  P_FIELD,
  P_KICKER,
  P_PAGE,
} from "@/components/planner/planner-ui";
import { type PastedImage, usePasteImages } from "@/components/planner/usePasteImages";

export default function NoteEditor({
  me,
  personSlug,
  initial,
}: {
  me: PlannerMember;
  personSlug: string;
  initial: PlannerNote;
}) {
  const [note, setNote] = useState(initial);
  const [images, setImages] = useState<PastedImage[]>(
    initial.images.map((i) => ({ url: i.url, label: i.label ?? "" }))
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const onPaste = usePasteImages(images, setImages, setErr);
  const canEdit = me.id === note.author_id || me.is_ceo;

  async function save() {
    if (!canEdit) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/planner/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: note.title, body: note.body, images }),
      });
      const j = (await res.json().catch(() => ({}))) as { note?: PlannerNote; error?: string };
      if (!res.ok) throw new Error(j.error || "Save failed");
      if (j.note) {
        setNote(j.note);
        setImages(j.note.images.map((i) => ({ url: i.url, label: i.label ?? "" })));
      }
      setMsg("Saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!canEdit || !confirm("Delete this note?")) return;
    const res = await fetch(`/api/planner/notes/${note.id}`, { method: "DELETE" });
    if (res.ok) window.location.href = `/planner/people/${personSlug}`;
  }

  return (
    <div className={P_PAGE}>
      <Link
        href={`/planner/people/${personSlug}`}
        className="text-[15px] text-[#1d9bf0] hover:underline"
      >
        Back to person
      </Link>
      <section className={P_BUBBLE}>
        <div className="flex items-center justify-between">
          <p className={P_KICKER}>Note</p>
          {canEdit ? <PlannerMore label="Delete" disabled={busy} onSelect={() => void remove()} /> : null}
        </div>
        <input
          className={`${P_FIELD} mt-3 font-heading text-xl`}
          value={note.title}
          disabled={!canEdit}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
        />
        <textarea
          className={`${P_FIELD} mt-3 min-h-[16rem]`}
          value={note.body}
          disabled={!canEdit}
          onChange={(e) => setNote({ ...note, body: e.target.value })}
          onPaste={(e) => canEdit && void onPaste(e)}
          placeholder="Type… paste screenshots anytime"
        />
        {images.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {images.map((img, i) => (
              <li key={`${img.url}-${i}`} className="overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full object-cover" />
                <input
                  className={`${P_FIELD} rounded-none border-0 border-t`}
                  disabled={!canEdit}
                  placeholder="Label"
                  value={img.label}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = { ...img, label: e.target.value };
                    setImages(next);
                  }}
                />
                {canEdit ? (
                  <button
                    type="button"
                    className="w-full py-2 text-[11px] uppercase tracking-[0.14em] text-rose-300/80"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {err ? <p className="mt-3 text-sm text-rose-300">{err}</p> : null}
        {msg ? <p className="mt-3 text-[15px] text-[#71767b]">{msg}</p> : null}
        {canEdit ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => void save()} className={P_BTN}>
              Save
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
