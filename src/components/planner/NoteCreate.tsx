"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlannerMember } from "@/data/planner";
import { DashHero } from "@/components/planner/planner-look";
import { P_BTN, P_FIELD, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";
import { type PastedImage, usePasteImages } from "@/components/planner/usePasteImages";

export default function NoteCreate({ person }: { person: PlannerMember }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<PastedImage[]>([]);
  const onPaste = usePasteImages(images, setImages, setErr);

  async function create() {
    if (!title.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/planner/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: person.id, title, body, images }),
      });
      const j = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok) throw new Error(j.error || "Create failed");
      router.push(j.id ? `/planner/people/${person.slug}/notes/${j.id}` : `/planner/people/${person.slug}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={P_PAGE}>
      <DashHero eyebrow={person.display_name} title="New note" text="A running page. Type freely and paste screenshots." />
      <section className="rounded-[28px] border border-white/25 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl sm:p-8">
        <label className={P_LABEL}>Title</label>
        <input className={P_FIELD} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className={`${P_LABEL} mt-4`}>Note</label>
        <textarea className={`${P_FIELD} min-h-40`} value={body} onChange={(e) => setBody(e.target.value)} onPaste={(e) => void onPaste(e)} placeholder="Paste images here" />
        {images.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {images.map((img, i) => (
              <li key={`${img.url}-${i}`} className="overflow-hidden rounded-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                <input
                  className={`${P_FIELD} rounded-none border-0 border-t`}
                  placeholder="Label"
                  value={img.label}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = { ...img, label: e.target.value };
                    setImages(next);
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" disabled={busy || !title.trim()} onClick={() => void create()} className={P_BTN}>
            Create note
          </button>
          <button type="button" className="text-[14px] text-white/60 hover:text-white" onClick={() => router.push(`/planner/people/${person.slug}`)}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
