"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import VaultAvatarSelect from "@/components/admin/VaultAvatarSelect";
import VaultChipSelect from "@/components/admin/VaultChipSelect";
import VaultCombo from "@/components/admin/VaultCombo";
import VaultModelSelect from "@/components/admin/VaultModelSelect";
import AiModelBadge from "@/components/vault/AiModelBadge";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";
import {
  YAIL_VAULT_CATEGORIES,
  tagsOfKind,
  yailVaultCategoryLabel,
  type YailVaultCategory,
  type YailVaultEntry,
  type YailVaultTag,
} from "@/data/yail-vault";
import VaultAvatarsDesk from "./VaultAvatarsDesk";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40 focus:bg-white/[0.09]";
const BUBBLE =
  "rounded-[1.35rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)] sm:p-5";

type Draft = {
  title: string;
  caption: string;
  notes: string;
  category: YailVaultCategory;
  genre: string;
  subject: string;
  avatar_id: string;
  labels: string[];
  ai_model: string;
  media_type: "image" | "video" | null;
  media_url: string;
  poster_url: string | null;
  featured: boolean;
  published: boolean;
  localBlob: Blob | null;
  previewUrl: string;
};

const emptyDraft = (): Draft => ({
  title: "",
  caption: "",
  notes: "",
  category: "filmmaking",
  genre: "",
  subject: "",
  avatar_id: "",
  labels: [],
  ai_model: "",
  media_type: null,
  media_url: "",
  poster_url: null,
  featured: false,
  published: true,
  localBlob: null,
  previewUrl: "",
});

function entryToDraft(entry: YailVaultEntry): Draft {
  return {
    title: entry.title,
    caption: entry.caption ?? "",
    notes: entry.notes ?? "",
    category: entry.category,
    genre: tagsOfKind(entry, "genre")[0]?.name ?? "",
    subject: tagsOfKind(entry, "subject")[0]?.name ?? "",
    avatar_id: entry.avatar_id ?? "",
    labels: tagsOfKind(entry, "label").map((t) => t.name),
    ai_model: entry.ai_model ?? "",
    media_type: entry.media_type,
    media_url: entry.media_url,
    poster_url: entry.poster_url,
    featured: entry.featured,
    published: entry.published,
    localBlob: null,
    previewUrl: entry.poster_url || entry.media_url,
  };
}

export default function VaultDesk() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"labs" | "avatars">("labs");
  const [entries, setEntries] = useState<YailVaultEntry[]>([]);
  const [tags, setTags] = useState<YailVaultTag[]>([]);
  const [avatars, setAvatars] = useState<YailVaultAvatar[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<YailVaultCategory | "all">("all");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [entriesRes, tagsRes, avatarsRes] = await Promise.all([
      fetch("/api/admin/yail-vault"),
      fetch("/api/admin/yail-vault?kind=tags"),
      fetch("/api/admin/yail-vault/avatars"),
    ]);
    const entriesJson = (await entriesRes.json().catch(() => ({}))) as {
      entries?: YailVaultEntry[];
      error?: string;
    };
    const tagsJson = (await tagsRes.json().catch(() => ({}))) as {
      tags?: YailVaultTag[];
    };
    const avatarsJson = (await avatarsRes.json().catch(() => ({}))) as {
      avatars?: YailVaultAvatar[];
    };
    if (!entriesRes.ok) {
      const missing = /does not exist|schema cache|074_yail_vault/i.test(entriesJson.error ?? "");
      setErr(
        missing
          ? "Run supabase/migrations/074_yail_vault.sql in the Supabase SQL editor first."
          : entriesJson.error || "Could not load vault."
      );
      return;
    }
    setErr("");
    setEntries(entriesJson.entries ?? []);
    setTags(tagsJson.tags ?? []);
    if (avatarsRes.ok) setAvatars(avatarsJson.avatars ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.previewUrl]);

  const genreOptions = useMemo(
    () => tags.filter((t) => t.kind === "genre").map((t) => t.name),
    [tags]
  );
  const subjectOptions = useMemo(
    () => tags.filter((t) => t.kind === "subject").map((t) => t.name),
    [tags]
  );
  const labelOptions = useMemo(
    () => tags.filter((t) => t.kind === "label").map((t) => t.name),
    [tags]
  );

  const visible = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.category === filter)),
    [entries, filter]
  );

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

  function startEdit(entry: YailVaultEntry) {
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    setEditingId(entry.id);
    setDraft(entryToDraft(entry));
    setErr("");
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onPickFile(file: File) {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      setErr("Use a photo or a video.");
      return;
    }
    const url = URL.createObjectURL(file);
    if (draft.previewUrl.startsWith("blob:")) URL.revokeObjectURL(draft.previewUrl);
    patch({
      media_type: isVideo ? "video" : "image",
      previewUrl: url,
      localBlob: file,
      media_url: "",
      poster_url: null,
    });
    setErr("");
  }

  async function uploadMedia(blob: Blob, filename: string) {
    const fd = new FormData();
    fd.append("file", blob, filename);
    const res = await fetch("/api/admin/yail-vault/upload-media", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as {
      url?: string;
      media_type?: "image" | "video";
      poster_url?: string | null;
      error?: string;
    };
    if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
    return j;
  }

  async function save() {
    setErr("");
    setMsg("");
    const title = draft.title.trim();
    if (!title) {
      setErr("Add a title.");
      return;
    }
    if (!draft.media_type && !draft.localBlob && !draft.media_url) {
      setErr("Upload a photo or a video.");
      return;
    }
    setBusy(true);
    try {
      let media_type = draft.media_type;
      let media_url = draft.media_url;
      let poster_url = draft.poster_url;
      if (draft.localBlob) {
        const uploaded = await uploadMedia(
          draft.localBlob,
          draft.localBlob instanceof File ? draft.localBlob.name : "vault-media.bin"
        );
        media_url = uploaded.url!;
        media_type = uploaded.media_type ?? draft.media_type ?? "image";
        poster_url = uploaded.poster_url ?? null;
      }
      if (!media_type || !media_url) throw new Error("Media is required");

      const body = {
        title,
        caption: draft.caption,
        notes: draft.notes,
        category: draft.category,
        genre: draft.genre.trim(),
        subject: draft.subject.trim(),
        avatar_id: draft.avatar_id.trim() || null,
        labels: draft.labels,
        ai_model: draft.ai_model.trim() || null,
        media_type,
        media_url,
        poster_url,
        featured: draft.featured,
        published: draft.published,
      };

      const res = await fetch(
        editingId ? `/api/admin/yail-vault/${editingId}` : "/api/admin/yail-vault",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const j = (await res.json().catch(() => ({}))) as {
        entries?: YailVaultEntry[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Save failed");
      setEntries(j.entries ?? []);
      setMsg(editingId ? "Updated." : "Posted to the vault.");
      reset();
      const tagsRes = await fetch("/api/admin/yail-vault?kind=tags");
      const tagsJson = (await tagsRes.json().catch(() => ({}))) as { tags?: YailVaultTag[] };
      if (tagsRes.ok) setTags(tagsJson.tags ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function patchEntry(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/yail-vault/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as {
        entries?: YailVaultEntry[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Update failed");
      setEntries(j.entries ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this vault entry?")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/yail-vault/${id}`, { method: "DELETE" });
      const j = (await res.json().catch(() => ({}))) as {
        entries?: YailVaultEntry[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Delete failed");
      setEntries(j.entries ?? []);
      if (editingId === id) reset();
      setMsg("Deleted.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const list = [...visible];
    const i = list.findIndex((e) => e.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const next = [...list];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item);
    // Optimistic
    const others = entries.filter((e) => (filter === "all" ? false : e.category !== filter));
    const merged = filter === "all" ? next : [...others, ...next];
    setEntries(merged);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/yail-vault/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map((e) => e.id) }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        entries?: YailVaultEntry[];
        error?: string;
      };
      if (!res.ok) throw new Error(j.error || "Reorder failed");
      setEntries(j.entries ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reorder failed");
      void load();
    } finally {
      setBusy(false);
    }
  }

  const avatarById = useMemo(() => new Map(avatars.map((a) => [a.id, a])), [avatars]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center gap-2.5">
        {(
          [
            { id: "labs" as const, label: "Lab cuts" },
            { id: "avatars" as const, label: "AI Avatars" },
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
          href="/vault"
          className="ml-auto rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/40 hover:text-white"
        >
          View vault
        </Link>
      </div>

      {tab === "avatars" ? (
        <VaultAvatarsDesk avatars={avatars} onChange={setAvatars} />
      ) : (
        <>
      <div className={BUBBLE}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-emerald-300/80">YAIL Vault</p>
            <h2 className="mt-1.5 font-heading text-2xl leading-none tracking-tight">
              {editingId ? "Edit lab cut" : "New lab cut"}
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/50">
              GenAI labs for AI Filmmaking and AI Ads. Pick an AI Avatar from the directory — manage them in the AI Avatars tab.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Title
              </span>
              <input
                className={FIELD}
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Test 01"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Caption
              </span>
              <input
                className={FIELD}
                value={draft.caption}
                onChange={(e) => patch({ caption: e.target.value })}
                placeholder="One line under the title"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Notes
              </span>
              <textarea
                className={`${FIELD} min-h-[7rem] resize-y`}
                value={draft.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                placeholder="Interesting findings from this experiment…"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <VaultCombo
                label="Category"
                locked
                value={draft.category}
                options={[]}
                optionValues={YAIL_VAULT_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                onChange={(v) => patch({ category: v as YailVaultCategory })}
                placeholder="AI Filmmaking or AI Ads"
              />
              <VaultCombo
                label="Genre"
                value={draft.genre}
                options={genreOptions}
                onChange={(v) => patch({ genre: v })}
                placeholder="Pick or type a genre"
              />
              <VaultCombo
                label="Subject"
                value={draft.subject}
                options={subjectOptions}
                onChange={(v) => patch({ subject: v })}
                placeholder="Pick or type a subject"
              />
              <VaultAvatarSelect
                value={draft.avatar_id}
                avatars={avatars}
                onChange={(v) => patch({ avatar_id: v })}
              />
              <div className="sm:col-span-2">
                <VaultModelSelect
                  value={draft.ai_model}
                  onChange={(v) => patch({ ai_model: v })}
                />
              </div>
              <div className="sm:col-span-2">
                <VaultChipSelect
                  label="Labels"
                  values={draft.labels}
                  options={labelOptions}
                  onChange={(v) => patch({ labels: v })}
                  placeholder="Type or pick a label…"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <label className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => patch({ featured: e.target.checked })}
                  className="accent-emerald-400"
                />
                Hero
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
          </div>

          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-white/12 bg-black/60">
              {draft.previewUrl ? (
                draft.media_type === "video" && !draft.localBlob?.type.startsWith("image/") ? (
                  <video
                    src={draft.media_url || draft.previewUrl}
                    poster={draft.poster_url ?? undefined}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.previewUrl} alt="" className="h-full w-full object-cover" />
                )
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/40">
                  Drop a still or a motion cut here
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
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
              Upload image or video
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void save()}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-100 disabled:opacity-40"
              >
                {busy ? "Saving…" : editingId ? "Save changes" : "Publish to vault"}
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

      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        {(
          [
            { id: "all" as const, label: "All" },
            ...YAIL_VAULT_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-4 py-2.5 text-[12px] font-semibold transition ${
              filter === tab.id
                ? "bg-white text-black"
                : "border border-white/15 bg-white/[0.04] text-white/65 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/35">{visible.length} cuts</span>
      </div>

      <div className="space-y-4">
        {visible.map((entry, index) => {
          const labels = tagsOfKind(entry, "label");
          const genre = tagsOfKind(entry, "genre")[0]?.name;
          const subject = tagsOfKind(entry, "subject")[0]?.name;
          const avatar = entry.avatar_id ? avatarById.get(entry.avatar_id) : null;
          const thumb = entry.poster_url || entry.media_url;
          return (
            <div key={entry.id} className={`${BUBBLE} !p-3 sm:!p-4`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-black/50 lg:aspect-[16/10] lg:w-52">
                  {entry.media_type === "video" ? (
                    <video
                      src={entry.media_url}
                      poster={entry.poster_url ?? undefined}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80">
                    {entry.media_type}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-300/70">
                        {yailVaultCategoryLabel(entry.category)}
                        {entry.featured ? " · Hero" : ""}
                        {!entry.published ? " · Draft" : ""}
                      </p>
                      <p className="mt-1 truncate font-heading text-lg leading-tight">{entry.title}</p>
                      {entry.caption ? (
                        <p className="mt-1 line-clamp-2 text-sm text-white/50">{entry.caption}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={busy || index === 0}
                        onClick={() => void move(entry.id, -1)}
                        className="rounded-full border border-white/15 px-2.5 py-1.5 text-[11px] text-white/65 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={busy || index === visible.length - 1}
                        onClick={() => void move(entry.id, 1)}
                        className="rounded-full border border-white/15 px-2.5 py-1.5 text-[11px] text-white/65 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-black"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void patchEntry(entry.id, { featured: !entry.featured })}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/70"
                      >
                        {entry.featured ? "Unhero" : "Make hero"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void patchEntry(entry.id, { published: !entry.published })}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/70"
                      >
                        {entry.published ? "Hide" : "Publish"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void remove(entry.id)}
                        className="rounded-full border border-rose-400/30 px-3 py-1.5 text-[11px] text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {genre ? (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/70">
                        Genre · {genre}
                      </span>
                    ) : null}
                    {subject ? (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/70">
                        Subject · {subject}
                      </span>
                    ) : null}
                    {avatar ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] text-emerald-200/90">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatar.portrait_url} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                        {avatar.name}
                      </span>
                    ) : null}
                    <AiModelBadge modelId={entry.ai_model} />
                    {labels.map((t) => (
                      <span
                        key={t.id}
                        className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/60"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                  {entry.notes ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-white/40">{entry.notes}</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        {!visible.length ? (
          <div className={`${BUBBLE} text-center text-sm text-white/45`}>
            No vault cuts yet. Post your first GenAI lab experiment above.
          </div>
        ) : null}
      </div>
        </>
      )}
    </div>
  );
}
