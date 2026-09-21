"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AvatarCropModal from "@/components/avatars/AvatarCropModal";
import { coverAspectClass } from "@/data/module-covers";
import {
  OTT_CUT_ASPECTS,
  OTT_CUT_CATEGORIES,
  guessOttCutMediaType,
  ottCutYoutubeId,
  type OttCut,
  type OttCutAspect,
  type OttCutCategory,
  type OttCutMediaType,
} from "@/data/ott-cuts";

const FIELD =
  "mt-2 w-full border border-white/20 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 caret-white outline-none transition focus:border-white/55";
const BTN = "bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100 disabled:opacity-40";

type Draft = {
  id: string | null;
  category: OttCutCategory;
  caption: string;
  description: string;
  aspect: OttCutAspect;
  mediaType: OttCutMediaType | null;
  previewUrl: string;
  remoteUrl: string;
  linkInput: string;
  localBlob: Blob | null;
  published: boolean;
};

const emptyDraft = (category: OttCutCategory = "ads"): Draft => ({
  id: null,
  category,
  caption: "",
  description: "",
  aspect: "natural",
  mediaType: null,
  previewUrl: "",
  remoteUrl: "",
  linkInput: "",
  localBlob: null,
  published: true,
});

function aspectLock(id: OttCutAspect): number | undefined {
  return OTT_CUT_ASPECTS.find((a) => a.id === id)?.ratio;
}

export default function OttCutsDesk() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [cuts, setCuts] = useState<OttCut[]>([]);
  const [filter, setFilter] = useState<OttCutCategory | "all">("all");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ott-cuts");
    const j = (await res.json().catch(() => ({}))) as { cuts?: OttCut[]; error?: string };
    if (!res.ok) {
      const missing = /does not exist|schema cache/i.test(j.error ?? "");
      setErr(missing ? "Run supabase/migrations/066_ott_cuts.sql in the Supabase SQL editor first." : j.error || "Could not load cuts.");
      return;
    }
    setCuts(j.cuts ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    };
    // only revoke when the preview url itself is replaced
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.previewUrl]);

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function reset(category: OttCutCategory = draft.category) {
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    setDraft(emptyDraft(category));
    setCropSrc(null);
  }

  function onPickFile(file: File) {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      setErr("Use a photo or a video file.");
      return;
    }
    const url = URL.createObjectURL(file);
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    patch({
      mediaType: isVideo ? "video" : "image",
      previewUrl: url,
      localBlob: file,
      remoteUrl: "",
      linkInput: "",
    });
    setErr("");
  }

  async function onCropComplete(blob: Blob) {
    const url = URL.createObjectURL(blob);
    if (draft.previewUrl.startsWith("blob:") && draft.previewUrl !== cropSrc) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    patch({
      mediaType: "image",
      previewUrl: url,
      localBlob: blob,
      remoteUrl: "",
      linkInput: "",
    });
    if (cropSrc?.startsWith("blob:") && cropSrc !== url) {
      /* keep original file blob around only if it was a remote crop */
    }
    setCropSrc(null);
  }

  function applyLink(raw: string) {
    const url = raw.trim();
    if (!url) {
      if (!draft.localBlob) {
        patch({ linkInput: "", remoteUrl: "", previewUrl: "", mediaType: null });
      } else {
        patch({ linkInput: "" });
      }
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      patch({ linkInput: url });
      setErr("Use a full http or https link.");
      return;
    }
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    setErr("");
    patch({
      linkInput: url,
      remoteUrl: url,
      previewUrl: url,
      localBlob: null,
      mediaType: guessOttCutMediaType(url),
    });
  }

  async function uploadMedia(blob: Blob, filename: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", blob, filename);
    const res = await fetch("/api/admin/ott-cuts/upload-media", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string; hint?: string };
    if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
    return j.url;
  }

  async function save() {
    setErr("");
    setMsg("");
    const caption = draft.caption.trim();
    if (!caption) {
      setErr("Add a caption.");
      return;
    }
    if (!draft.mediaType || (!draft.localBlob && !draft.remoteUrl && !draft.linkInput.trim())) {
      setErr("Upload a file or paste a URL.");
      return;
    }
    setBusy(true);
    try {
      let mediaType = draft.mediaType;
      let media_url = draft.remoteUrl || draft.linkInput.trim();
      if (draft.localBlob) {
        const name =
          mediaType === "video"
            ? `cut-${Date.now()}.mp4`
            : `cut-${Date.now()}.jpg`;
        media_url = await uploadMedia(draft.localBlob, name);
      } else if (media_url) {
        mediaType = mediaType ?? guessOttCutMediaType(media_url);
      }
      if (!media_url) throw new Error("Upload a file or paste a URL.");
      if (!/^https?:\/\//i.test(media_url)) {
        throw new Error("Use a full http or https link.");
      }
      if (!mediaType) throw new Error("Pick photo or video.");
      const payload = {
        caption,
        description: draft.description.trim(),
        category: draft.category,
        media_type: mediaType,
        media_url,
        aspect_ratio: draft.aspect,
        published: draft.published,
      };
      const res = await fetch(draft.id ? `/api/admin/ott-cuts/${draft.id}` : "/api/admin/ott-cuts", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Could not save");
      setMsg(draft.id ? "Cut updated." : "Cut saved.");
      reset(draft.category);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  function edit(cut: OttCut) {
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    setDraft({
      id: cut.id,
      category: cut.category,
      caption: cut.caption,
      description: cut.description ?? "",
      aspect: cut.aspect_ratio,
      mediaType: cut.media_type,
      previewUrl: cut.media_url,
      remoteUrl: cut.media_url,
      linkInput: cut.media_url,
      localBlob: null,
      published: cut.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(cut: OttCut) {
    if (!confirm(`Delete “${cut.caption}”?`)) return;
    const res = await fetch(`/api/admin/ott-cuts/${cut.id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(j.error || "Could not delete");
      return;
    }
    if (draft.id === cut.id) reset();
    await load();
  }

  async function togglePublished(cut: OttCut) {
    await fetch(`/api/admin/ott-cuts/${cut.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !cut.published }),
    });
    await load();
  }

  const visible = filter === "all" ? cuts : cuts.filter((c) => c.category === filter);
  const lock = aspectLock(draft.aspect);
  const frameClass = coverAspectClass(draft.aspect);

  return (
    <section className="space-y-6">
      {cropSrc ? (
        <AvatarCropModal
          imageSrc={cropSrc}
          title="Crop this still"
          lockAspect={lock}
          tone="dark"
          onCancel={() => setCropSrc(null)}
          onComplete={async (blob) => {
            await onCropComplete(blob);
          }}
        />
      ) : null}

      <div className="border border-white/15 bg-black/45 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">NEW CUT</p>
            <h2 className="mt-1 font-heading text-2xl leading-none">
              {draft.id ? "Edit cut" : "Add a photo, video, or URL"}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Pick a rail, upload media or paste a link, choose a ratio, caption it. Description is optional.
            </p>
          </div>
          {draft.id ? (
            <button type="button" onClick={() => reset()} className="border border-white/30 px-4 py-2 text-sm text-white hover:border-white">
              New cut
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {OTT_CUT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => patch({ category: c.id })}
              className={`border px-4 py-3 text-left transition ${
                draft.category === c.id ? "border-white bg-white/[0.08]" : "border-white/15 hover:border-white/40"
              }`}
            >
              <p className="font-heading text-xl leading-none text-blue-400">{c.scene}</p>
              <p className="mt-1 text-sm font-semibold">{c.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) onPickFile(f);
              }}
            />
            {(() => {
              const yt = draft.previewUrl ? ottCutYoutubeId(draft.previewUrl) : null;
              const frame = `relative flex w-full items-center justify-center overflow-hidden border border-dashed border-white/25 bg-white/[0.03] ${
                draft.previewUrl ? (draft.aspect === "natural" ? "min-h-[14rem]" : frameClass) : "min-h-[16rem]"
              }`;
              if (yt) {
                return (
                  <div className={frame}>
                    <iframe
                      src={`https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1`}
                      title="URL preview"
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              return (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) onPickFile(f);
                  }}
                  className={frame}
                >
                  {draft.previewUrl ? (
                    draft.mediaType === "video" ? (
                      <video
                        src={draft.previewUrl}
                        className="max-h-[22rem] w-full object-contain"
                        controls
                        playsInline
                        controlsList="nodownload noplaybackrate noremoteplayback"
                        disablePictureInPicture
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={draft.previewUrl} alt="" className="max-h-[22rem] w-full object-contain" />
                    )
                  ) : (
                    <span className="px-4 text-center text-sm text-white/55">Drop a photo or video, or click to choose</span>
                  )}
                </button>
              );
            })()}
            <label className="mt-3 block text-xs font-medium text-white/70">
              Or paste a URL
              <input
                value={draft.linkInput}
                onChange={(e) => patch({ linkInput: e.target.value })}
                onBlur={(e) => applyLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink(draft.linkInput);
                  }
                }}
                className={FIELD}
                placeholder="https://…  mp4, image, or YouTube"
              />
            </label>
            {draft.linkInput || draft.remoteUrl ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {(["image", "video"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => patch({ mediaType: kind })}
                    className={`px-3 py-1.5 text-xs font-semibold ${
                      draft.mediaType === kind ? "bg-[#fafafa] text-black" : "border border-white/25 text-white/80 hover:border-white"
                    }`}
                  >
                    {kind === "image" ? "Photo" : "Video"}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:border-white">
                {draft.previewUrl ? "Replace" : "Choose file"}
              </button>
              {draft.mediaType === "image" && draft.previewUrl ? (
                <button
                  type="button"
                  onClick={() => setCropSrc(draft.previewUrl)}
                  className="border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:border-white"
                >
                  Crop
                </button>
              ) : null}
            </div>
            {draft.mediaType === "video" ? (
              <p className="mt-2 text-[11px] text-white/45">Videos keep their pixels. Ratio only sets the card frame.</p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-white/70">Ratio</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {OTT_CUT_ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => patch({ aspect: a.id })}
                    className={`px-3 py-1.5 text-xs font-semibold ${
                      draft.aspect === a.id ? "bg-[#fafafa] text-black" : "border border-white/25 text-white/80 hover:border-white"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-xs font-medium text-white/70">
              Caption
              <input
                value={draft.caption}
                onChange={(e) => patch({ caption: e.target.value })}
                className={FIELD}
                placeholder="The line under the still"
              />
            </label>
            <label className="block text-xs font-medium text-white/70">
              Description <span className="text-white/40">(optional)</span>
              <textarea
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
                className={`${FIELD} min-h-[96px] resize-y`}
                placeholder="A short note for the ads / films / community page"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => patch({ published: e.target.checked })}
              />
              Published
            </label>
            <button type="button" onClick={() => void save()} disabled={busy} className={BTN}>
              {busy ? "Saving…" : draft.id ? "Update cut" : "Save cut"}
            </button>
          </div>
        </div>

        {err ? <p className="mt-4 text-sm text-red-300">{err}</p> : null}
        {msg ? <p className="mt-4 text-sm text-white/75">{msg}</p> : null}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-heading text-xl leading-none">Library</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold ${
                filter === "all" ? "bg-[#fafafa] text-black" : "border border-white/25 text-white/80"
              }`}
            >
              All
            </button>
            {OTT_CUT_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`px-3 py-1.5 text-xs font-semibold ${
                  filter === c.id ? "bg-[#fafafa] text-black" : "border border-white/25 text-white/80"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">Nothing on this rail yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((cut) => (
              <li key={cut.id} className="border border-white/15 bg-black/40">
                <div className={`overflow-hidden bg-black ${coverAspectClass(cut.aspect_ratio) || "aspect-video"}`}>
                  {ottCutYoutubeId(cut.media_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${ottCutYoutubeId(cut.media_url)}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                  ) : cut.media_type === "video" ? (
                    <video src={cut.media_url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cut.media_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-white/40">
                    {OTT_CUT_CATEGORIES.find((c) => c.id === cut.category)?.label.toUpperCase()} · {cut.aspect_ratio}
                    {cut.published ? "" : " · DRAFT"}
                  </p>
                  <p className="mt-1 font-heading text-lg leading-none">{cut.caption}</p>
                  {cut.description ? <p className="mt-2 line-clamp-2 text-xs text-white/55">{cut.description}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => edit(cut)} className="border border-white/30 px-3 py-1 text-xs font-semibold hover:border-white">
                      Edit
                    </button>
                    <button type="button" onClick={() => void togglePublished(cut)} className="border border-white/30 px-3 py-1 text-xs font-semibold hover:border-white">
                      {cut.published ? "Unpublish" : "Publish"}
                    </button>
                    <button type="button" onClick={() => void remove(cut)} className="border border-red-400/40 px-3 py-1 text-xs font-semibold text-red-200 hover:border-red-300">
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
