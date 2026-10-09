"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40 focus:bg-white/[0.09]";
const BUBBLE =
  "rounded-[1.35rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)] sm:p-5";

type Draft = {
  name: string;
  tagline: string;
  bio: string;
  portrait_url: string;
  published: boolean;
  localBlob: Blob | null;
  previewUrl: string;
};

const emptyDraft = (): Draft => ({
  name: "",
  tagline: "",
  bio: "",
  portrait_url: "",
  published: true,
  localBlob: null,
  previewUrl: "",
});

function entryToDraft(a: YailVaultAvatar): Draft {
  return {
    name: a.name,
    tagline: a.tagline ?? "",
    bio: a.bio ?? "",
    portrait_url: a.portrait_url,
    published: a.published,
    localBlob: null,
    previewUrl: a.portrait_url,
  };
}

type Props = {
  avatars: YailVaultAvatar[];
  onChange: (avatars: YailVaultAvatar[]) => void;
};

export default function VaultAvatarsDesk({ avatars, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    return () => {
      if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.previewUrl]);

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function reset() {
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    setDraft(emptyDraft());
    setEditingId(null);
    setErr("");
    setMsg("");
  }

  function startEdit(a: YailVaultAvatar) {
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    setEditingId(a.id);
    setDraft(entryToDraft(a));
    setErr("");
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onPickFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErr("Use a portrait image.");
      return;
    }
    const url = URL.createObjectURL(file);
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    patch({ previewUrl: url, localBlob: file, portrait_url: "" });
    setErr("");
  }

  const uploadPortrait = useCallback(async (blob: Blob, filename: string) => {
    const fd = new FormData();
    fd.append("file", blob, filename);
    const res = await fetch("/api/admin/yail-vault/upload-media", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
    return j.url;
  }, []);

  async function save() {
    setErr("");
    setMsg("");
    const name = draft.name.trim();
    if (!name) {
      setErr("Add a name.");
      return;
    }
    if (!draft.localBlob && !draft.portrait_url) {
      setErr("Upload a portrait.");
      return;
    }
    setBusy(true);
    try {
      let portrait_url = draft.portrait_url;
      if (draft.localBlob) {
        portrait_url = await uploadPortrait(
          draft.localBlob,
          draft.localBlob instanceof File ? draft.localBlob.name : "avatar.jpg"
        );
      }
      const body = {
        name,
        tagline: draft.tagline,
        bio: draft.bio,
        portrait_url,
        published: draft.published,
      };
      const res = await fetch(
        editingId ? `/api/admin/yail-vault/avatars/${editingId}` : "/api/admin/yail-vault/avatars",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const j = (await res.json().catch(() => ({}))) as {
        avatars?: YailVaultAvatar[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Save failed");
      onChange(j.avatars ?? []);
      setMsg(editingId ? "Avatar updated." : "Avatar added to the directory.");
      reset();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this avatar from the directory?")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/yail-vault/avatars/${id}`, { method: "DELETE" });
      const j = (await res.json().catch(() => ({}))) as {
        avatars?: YailVaultAvatar[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Delete failed");
      onChange(j.avatars ?? []);
      if (editingId === id) reset();
      setMsg("Deleted.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(a: YailVaultAvatar) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/yail-vault/avatars/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !a.published }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        avatars?: YailVaultAvatar[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Update failed");
      onChange(j.avatars ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className={BUBBLE}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-emerald-300/80">
              AI Avatars
            </p>
            <h2 className="mt-1.5 font-heading text-2xl leading-none tracking-tight">
              {editingId ? "Edit avatar" : "New avatar"}
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/50">
              Portrait + name land in the vault directory and in the AI Avatar dropdown on every cut.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Name
              </span>
              <input
                className={FIELD}
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Maya"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Tagline
              </span>
              <input
                className={FIELD}
                value={draft.tagline}
                onChange={(e) => patch({ tagline: e.target.value })}
                placeholder="Brand presence · multilingual"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Bio
              </span>
              <textarea
                className={`${FIELD} min-h-[7rem] resize-y`}
                value={draft.bio}
                onChange={(e) => patch({ bio: e.target.value })}
                placeholder="Who they are, how they show up across filmmaking and ads…"
              />
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => patch({ published: e.target.checked })}
                className="accent-emerald-400"
              />
              Published
            </label>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-white/12 bg-black/60">
              {draft.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/40">
                  Portrait still
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFile(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-full border border-dashed border-white/25 bg-white/[0.04] py-3 text-sm font-semibold text-white/80 transition hover:border-emerald-300/50 hover:text-white"
            >
              Upload portrait
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void save()}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-100 disabled:opacity-40"
              >
                {busy ? "Saving…" : editingId ? "Save changes" : "Add to directory"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        {msg ? <p className="mt-4 text-sm text-emerald-300">{msg}</p> : null}
      </div>

      <div className="space-y-4">
        {avatars.map((a) => (
          <div key={a.id} className={`${BUBBLE} !p-3 sm:!p-4`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl bg-black/50 sm:aspect-square sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.portrait_url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-300/70">
                      {a.published ? "Published" : "Draft"}
                    </p>
                    <p className="mt-1 truncate font-heading text-lg leading-tight">{a.name}</p>
                    {a.tagline ? (
                      <p className="mt-1 line-clamp-2 text-sm text-white/50">{a.tagline}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-black"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void togglePublished(a)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/70"
                    >
                      {a.published ? "Hide" : "Publish"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(a.id)}
                      className="rounded-full border border-rose-400/30 px-3 py-1.5 text-[11px] text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {a.bio ? (
                  <p className="line-clamp-2 text-xs leading-relaxed text-white/40">{a.bio}</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {!avatars.length ? (
          <div className={`${BUBBLE} text-center text-sm text-white/45`}>
            No avatars yet. Add the first personality above — it will show on the vault page and in cut dropdowns.
          </div>
        ) : null}
      </div>
    </div>
  );
}
