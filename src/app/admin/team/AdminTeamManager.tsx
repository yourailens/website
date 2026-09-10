"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ModuleGalleryEditor, {
  type ModuleGalleryItemDraft,
} from "@/components/admin/ModuleGalleryEditor";
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
    <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">Admin → Team</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">Studio team</h1>
            <p className="mt-1 text-sm text-slate-600">Profiles, roles, work (any ratio), and pasted or uploaded links.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={openNew}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add member
            </button>
          </div>
        </header>

        {msg ? <p className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">{msg}</p> : null}

        {showing ? (
          <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => sf("name", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Role
                <input
                  value={form.role}
                  onChange={(e) => sf("role", e.target.value)}
                  placeholder="Director / Producer"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Slug
                <input
                  value={form.slug}
                  onChange={(e) => sf("slug", e.target.value)}
                  placeholder={slugify(form.name) || "name"}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="block text-sm font-medium">
                Sort order
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => sf("sort_order", Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
            </div>

            <label className="block text-sm font-medium">
              Short bio (listing card)
              <textarea
                value={form.short_bio}
                onChange={(e) => sf("short_bio", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              Full bio (profile page)
              <textarea
                value={form.bio}
                onChange={(e) => sf("bio", e.target.value)}
                rows={6}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>

            <div>
              <p className="text-sm font-medium">Portrait</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  type="url"
                  value={form.portrait_url}
                  onChange={(e) => sf("portrait_url", e.target.value)}
                  placeholder="Paste image URL or upload"
                  className="min-w-[16rem] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => portraitRef.current?.click()}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                >
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
                <img src={form.portrait_url} alt="" className="mt-3 h-32 w-24 rounded-xl object-cover" />
              ) : null}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => sf("published", e.target.checked)}
              />
              Published
            </label>

            <div>
              <p className="mb-3 text-sm font-medium">Profile links (site, Instagram, LinkedIn…)</p>
              <div className="space-y-2">
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
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => sf("links", form.links.filter((_, idx) => idx !== i))}
                      className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => sf("links", [...form.links, { label: "", url: "", sort_order: form.links.length }])}
                className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold"
              >
                + Add link
              </button>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Work gallery — images, videos, any ratio, upload or paste URL</p>
              <ModuleGalleryEditor
                items={form.items}
                onChange={(items) => sf("items", items)}
                uploadSlug={uploadSlug}
                showPromptField
                allowUrlPaste
                uploadPath="/api/admin/team/upload-media"
              />
              <p className="mt-2 text-xs text-slate-500">The prompt field here is stored as the work title.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save member"}
              </button>
              <button
                type="button"
                onClick={() => setShowing(false)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <ul className="space-y-3">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4"
              >
                <div>
                  <p className="font-heading text-lg font-bold">{m.name}</p>
                  <p className="text-sm text-slate-500">
                    {m.role || "No role"} · /team/{m.slug} · {m.published ? "Published" : "Draft"} · {m.work.length} work
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(m)} className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold">
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(m)} className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {members.length === 0 ? <p className="text-sm text-slate-500">No members yet.</p> : null}
          </ul>
        )}
      </div>
    </main>
  );
}
