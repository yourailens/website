"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ModuleGalleryEditor, {
  type ModuleGalleryItemDraft,
} from "@/components/admin/ModuleGalleryEditor";
import {
  ADMIN_BTN,
  ADMIN_BTN_DANGER,
  ADMIN_BTN_GHOST,
  ADMIN_BUBBLE_PAD,
  ADMIN_FIELD,
  ADMIN_KICKER,
  ADMIN_LABEL,
  ADMIN_PAGE,
  ADMIN_PILL,
  ADMIN_ROW,
} from "@/components/admin/admin-ui";
import type { StudioTeamLink, StudioTeamMemberPublic } from "@/data/studio-team";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type FormState = {
  name: string;
  slug: string;
  role: string;
  short_bio: string;
  bio: string;
  portrait_url: string;
  published: boolean;
  sort_order: number;
  items: ModuleGalleryItemDraft[];
  links: StudioTeamLink[];
};

const BLANK: FormState = {
  name: "",
  slug: "",
  role: "",
  short_bio: "",
  bio: "",
  portrait_url: "",
  published: false,
  sort_order: 0,
  items: [],
  links: [],
};

function itemsFromMember(m: StudioTeamMemberPublic): ModuleGalleryItemDraft[] {
  return m.work.map((i) => ({
    media_type: i.media_type,
    image_url: i.image_url ?? "",
    video_url: i.video_url ?? "",
    poster_url: i.poster_url ?? "",
    aspect_ratio: i.aspect_ratio,
    caption: i.caption ?? "",
    prompt: i.title ?? "",
  }));
}

export default function AdminTeamManager() {
  const [members, setMembers] = useState<StudioTeamMemberPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StudioTeamMemberPublic | null>(null);
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const portraitRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const json = (await res.json()) as { members?: StudioTeamMemberPublic[] };
      setMembers(json.members ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function sf<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openNew() {
    setEditing(null);
    setForm(BLANK);
    setShowing(true);
    setMsg("");
  }

  function openEdit(m: StudioTeamMemberPublic) {
    setEditing(m);
    setForm({
      name: m.name,
      slug: m.slug,
      role: m.role,
      short_bio: m.short_bio ?? "",
      bio: m.bio ?? "",
      portrait_url: m.portrait_url ?? "",
      published: m.published,
      sort_order: m.sort_order,
      items: itemsFromMember(m),
      links: m.links.map((l) => ({ label: l.label, url: l.url, sort_order: l.sort_order })),
    });
    setShowing(true);
    setMsg("");
  }

  async function uploadPortrait(file: File, slug: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug);
    const res = await fetch("/api/admin/team/upload-media", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Portrait upload failed");
    return ((await res.json()) as { url?: string }).url ?? "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const slug = (editing?.slug || form.slug || slugify(form.name)).trim();
      const payload = {
        slug,
        name: form.name.trim(),
        role: form.role.trim(),
        short_bio: form.short_bio.trim() || null,
        bio: form.bio.trim() || null,
        portrait_url: form.portrait_url.trim() || null,
        published: form.published,
        sort_order: form.sort_order,
        work: form.items.map((a, i) => ({
          media_type: a.media_type,
          image_url: a.image_url || null,
          video_url: a.video_url || null,
          poster_url: a.poster_url || null,
          aspect_ratio: a.aspect_ratio,
          title: a.prompt.trim() || null,
          caption: a.caption.trim() || null,
          sort_order: i,
        })),
        links: form.links.map((l, i) => ({
          label: l.label,
          url: l.url,
          sort_order: i,
        })),
      };

      const res = await fetch(editing ? `/api/admin/team/${editing.id}` : "/api/admin/team", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      setMsg("Saved.");
      setShowing(false);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(m: StudioTeamMemberPublic) {
    if (!confirm(`Delete ${m.name}?`)) return;
    await fetch(`/api/admin/team/${m.id}`, { method: "DELETE" });
    await load();
  }

  const uploadSlug = form.slug.trim() || slugify(form.name) || "member";

  return (
    <div className={`${ADMIN_PAGE} max-w-4xl`}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={ADMIN_KICKER}>Studio</p>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
            Profiles, roles, work (any ratio), and pasted or uploaded links.
          </p>
        </div>
        <button type="button" onClick={openNew} className={ADMIN_BTN}>
          Add member
        </button>
      </header>

      {msg ? (
        <p className={`${ADMIN_ROW} text-sm text-emerald-200`}>{msg}</p>
      ) : null}

      {showing ? (
        <form onSubmit={onSubmit} className={`${ADMIN_BUBBLE_PAD} space-y-6`}>
          <div>
            <p className={ADMIN_KICKER}>{editing ? "Edit member" : "New member"}</p>
            <h2 className="mt-1.5 font-heading text-2xl leading-none tracking-tight">
              {editing ? editing.name : "Add to the roster"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={ADMIN_LABEL}>Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => sf("name", e.target.value)}
                className={ADMIN_FIELD}
              />
            </label>
            <label className="block">
              <span className={ADMIN_LABEL}>Role</span>
              <input
                value={form.role}
                onChange={(e) => sf("role", e.target.value)}
                placeholder="Director / Producer"
                className={ADMIN_FIELD}
              />
            </label>
            <label className="block">
              <span className={ADMIN_LABEL}>Slug</span>
              <input
                value={form.slug}
                onChange={(e) => sf("slug", e.target.value)}
                placeholder={slugify(form.name) || "name"}
                className={`${ADMIN_FIELD} font-mono`}
              />
            </label>
            <label className="block">
              <span className={ADMIN_LABEL}>Sort order</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => sf("sort_order", Number(e.target.value))}
                className={ADMIN_FIELD}
              />
            </label>
          </div>

          <label className="block">
            <span className={ADMIN_LABEL}>Short bio (listing card)</span>
            <textarea
              value={form.short_bio}
              onChange={(e) => sf("short_bio", e.target.value)}
              rows={2}
              className={ADMIN_FIELD}
            />
          </label>
          <label className="block">
            <span className={ADMIN_LABEL}>Full bio (profile page)</span>
            <textarea
              value={form.bio}
              onChange={(e) => sf("bio", e.target.value)}
              rows={6}
              className={ADMIN_FIELD}
            />
          </label>

          <div>
            <span className={ADMIN_LABEL}>Portrait</span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="url"
                value={form.portrait_url}
                onChange={(e) => sf("portrait_url", e.target.value)}
                placeholder="Paste image URL or upload"
                className={`min-w-[16rem] flex-1 ${ADMIN_FIELD}`}
              />
              <button type="button" onClick={() => portraitRef.current?.click()} className={ADMIN_BTN_GHOST}>
                Upload
              </button>
              <input
                ref={portraitRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setBusy(true);
                  try {
                    sf("portrait_url", await uploadPortrait(file, uploadSlug));
                  } catch (err) {
                    setMsg(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </div>
            {form.portrait_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.portrait_url} alt="" className="mt-3 h-32 w-24 rounded-2xl object-cover" />
            ) : null}
          </div>

          <label className={`${ADMIN_PILL} inline-flex items-center gap-2`}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => sf("published", e.target.checked)}
              className="accent-emerald-400"
            />
            Published
          </label>

          <div>
            <p className={ADMIN_LABEL}>Profile links</p>
            <div className="mt-2 space-y-2">
              {form.links.map((link, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                  <input
                    value={link.label}
                    onChange={(e) => {
                      const next = [...form.links];
                      next[i] = { ...next[i], label: e.target.value };
                      sf("links", next);
                    }}
                    placeholder="Label"
                    className={ADMIN_FIELD}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...form.links];
                      next[i] = { ...next[i], url: e.target.value };
                      sf("links", next);
                    }}
                    placeholder="https://"
                    className={ADMIN_FIELD}
                  />
                  <button
                    type="button"
                    onClick={() => sf("links", form.links.filter((_, idx) => idx !== i))}
                    className={ADMIN_BTN_DANGER}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => sf("links", [...form.links, { label: "", url: "", sort_order: form.links.length }])}
              className={`mt-3 ${ADMIN_BTN_GHOST} text-xs`}
            >
              + Add link
            </button>
          </div>

          <div>
            <p className={ADMIN_LABEL}>Work gallery</p>
            <p className="mb-3 text-xs text-white/40">Images, videos, any ratio — upload or paste URL. Prompt field = work title.</p>
            <ModuleGalleryEditor
              items={form.items}
              onChange={(items) => sf("items", items)}
              uploadSlug={uploadSlug}
              showPromptField
              allowUrlPaste
              uploadPath="/api/admin/team/upload-media"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className={ADMIN_BTN}>
              {busy ? "Saving…" : "Save member"}
            </button>
            <button type="button" onClick={() => setShowing(false)} className={ADMIN_BTN_GHOST}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-white/45">Loading…</p>
      ) : (
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.id} className={`flex flex-wrap items-center justify-between gap-3 ${ADMIN_ROW}`}>
              <div>
                <p className="font-heading text-lg leading-tight">{m.name}</p>
                <p className="mt-1 text-sm text-white/45">
                  {m.role || "No role"} · /team/{m.slug} · {m.published ? "Published" : "Draft"} · {m.work.length}{" "}
                  work
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-black"
                >
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(m)} className={ADMIN_BTN_DANGER}>
                  Delete
                </button>
              </div>
            </li>
          ))}
          {members.length === 0 ? <p className="text-sm text-white/45">No members yet.</p> : null}
        </ul>
      )}
    </div>
  );
}
