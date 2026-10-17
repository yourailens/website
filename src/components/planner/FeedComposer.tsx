"use client";

import { useState } from "react";
import type { PlannerPost } from "@/data/planner";
import { P_BTN } from "@/components/planner/planner-ui";
import { type PastedImage, usePasteImages } from "@/components/planner/usePasteImages";

export default function FeedComposer({
  onPosted,
  initial = "Y",
}: {
  onPosted: (posts: PlannerPost[]) => void;
  initial?: string;
}) {
  const [body, setBody] = useState("");
  const [images, setImages] = useState<PastedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const onPaste = usePasteImages(images, setImages, setErr);

  async function submit() {
    if (!body.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/planner/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, images }),
      });
      const j = (await res.json().catch(() => ({}))) as { posts?: PlannerPost[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Post failed");
      onPosted(j.posts ?? []);
      setBody("");
      setImages([]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Post failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex gap-3 rounded-[28px] border border-white/25 bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <textarea
          className="min-h-[72px] w-full resize-none bg-transparent text-[17px] text-white outline-none placeholder:text-white/30"
          placeholder="What's happening?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onPaste={(e) => void onPaste(e)}
        />
        {images.length ? (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {images.map((img, i) => (
              <li key={`${img.url}-${i}`} className="overflow-hidden rounded-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                <input
                  className="w-full border-t border-white/10 bg-white/[0.06] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/30"
                  placeholder="Label"
                  value={img.label}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = { ...img, label: e.target.value };
                    setImages(next);
                  }}
                />
                <button
                  type="button"
                  className="w-full py-1.5 text-[13px] text-white/75 hover:text-white"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {err ? <p className="mt-2 text-sm text-white/60">{err}</p> : null}
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-[13px] text-white/30">Paste a screenshot</p>
          <button type="button" disabled={busy || !body.trim()} onClick={() => void submit()} className={P_BTN}>
            Post
          </button>
        </div>
      </div>
    </section>
  );
}
