"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  STUDIO_EVENT_TYPES,
  studioEventTypeLabel,
  type StudioEvent,
  type StudioEventType,
} from "@/data/studio-events";

const FIELD =
  "mt-2 w-full border border-white/20 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 caret-white outline-none transition focus:border-white/55 [color-scheme:dark]";
const BTN = "bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100 disabled:opacity-40";
const PANEL = "border border-white/15 bg-black/45 p-6";

type Draft = {
  id: string | null;
  title: string;
  subtitle: string;
  description: string;
  event_type: StudioEventType;
  venue: string;
  location_label: string;
  date_label: string;
  starts_at: string;
  ends_at: string;
  cta_label: string;
  href: string;
  image_url: string;
  published: boolean;
  sort_order: number;
};

const emptyDraft = (): Draft => ({
  id: null,
  title: "",
  subtitle: "",
  description: "",
  event_type: "meetup",
  venue: "",
  location_label: "",
  date_label: "",
  starts_at: "",
  ends_at: "",
  cta_label: "",
  href: "",
  image_url: "",
  published: true,
  sort_order: 0,
});

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(v: string): string | null {
  if (!v.trim()) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminEventsDesk() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    const j = (await res.json().catch(() => ({}))) as { events?: StudioEvent[]; error?: string };
    if (!res.ok) {
      const missing = /does not exist|schema cache/i.test(j.error ?? "");
      setErr(
        missing
          ? "Run supabase/migrations/068_studio_events.sql in the Supabase SQL editor first."
          : j.error || "Could not load events."
      );
      return;
    }
    setErr("");
    setEvents(j.events ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function reset() {
    setDraft(emptyDraft());
    setErr("");
    setMsg("");
  }

  function edit(ev: StudioEvent) {
    setDraft({
      id: ev.id,
      title: ev.title,
      subtitle: ev.subtitle ?? "",
      description: ev.description ?? "",
      event_type: ev.event_type,
      venue: ev.venue ?? "",
      location_label: ev.location_label ?? "",
      date_label: ev.date_label ?? "",
      starts_at: toDatetimeLocal(ev.starts_at),
      ends_at: toDatetimeLocal(ev.ends_at),
      cta_label: ev.cta_label ?? "",
      href: ev.href ?? "",
      image_url: ev.image_url ?? "",
      published: ev.published,
      sort_order: ev.sort_order,
    });
    setErr("");
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadPoster(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/events/upload-media", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
    return j.url;
  }

  async function onPickFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErr("Use an image for the poster.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const url = await uploadPoster(file);
      patch({ image_url: url });
      setMsg("Poster uploaded.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    setErr("");
    setMsg("");
    const title = draft.title.trim();
    if (!title) {
      setErr("Add a title.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title,
        subtitle: draft.subtitle.trim(),
        description: draft.description.trim(),
        event_type: draft.event_type,
        venue: draft.venue.trim(),
        location_label: draft.location_label.trim(),
        date_label: draft.date_label.trim(),
        starts_at: fromDatetimeLocal(draft.starts_at),
        ends_at: fromDatetimeLocal(draft.ends_at),
        cta_label: draft.cta_label.trim(),
        href: draft.href.trim(),
        image_url: draft.image_url.trim(),
        published: draft.published,
        sort_order: draft.sort_order,
      };
      const res = await fetch(draft.id ? `/api/admin/events/${draft.id}` : "/api/admin/events", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Could not save");
      setMsg(draft.id ? "Event updated." : "Event saved.");
      reset();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(ev: StudioEvent) {
    if (!confirm(`Delete “${ev.title}”?`)) return;
    const res = await fetch(`/api/admin/events/${ev.id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(j.error || "Could not delete");
      return;
    }
    if (draft.id === ev.id) reset();
    await load();
  }

  async function togglePublished(ev: StudioEvent) {
    await fetch(`/api/admin/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !ev.published }),
    });
    await load();
  }

  return (
    <main className="ott-home relative min-h-screen overflow-x-hidden bg-black px-5 py-10 font-body text-white sm:px-8 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 12% 0%, rgba(37,99,235,0.32), transparent 55%), radial-gradient(ellipse 40% 30% at 90% 0%, rgba(29,78,216,0.18), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CONTROL ROOM</p>
            <h1 className="mt-2 font-heading text-[clamp(2rem,5vw,3rem)] leading-none">Events</h1>
            <p className="mt-2 text-sm text-white/65">Titles, venues, dates, and links for the OTT events page.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="border border-white/30 px-4 py-2 text-sm text-white hover:border-white">
              Desk
            </Link>
            <Link href="/events" className="border border-white/30 px-4 py-2 text-sm text-white hover:border-white">
              View page
            </Link>
          </div>
        </header>

        <section className={PANEL}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">
                {draft.id ? "EDIT EVENT" : "NEW EVENT"}
              </p>
              <h2 className="mt-1 font-heading text-2xl leading-none">
                {draft.id ? "Update listing" : "Add a listing"}
              </h2>
            </div>
            {draft.id ? (
              <button type="button" onClick={reset} className="border border-white/30 px-4 py-2 text-sm hover:border-white">
                New event
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Title</span>
              <input className={FIELD} value={draft.title} onChange={(e) => patch({ title: e.target.value })} placeholder="YAIL 01: AI Creators Meetup" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Subtitle</span>
              <input className={FIELD} value={draft.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} placeholder="The Theatre Showcase" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Type</span>
              <select className={FIELD} value={draft.event_type} onChange={(e) => patch({ event_type: e.target.value as StudioEventType })}>
                {STUDIO_EVENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-black text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Venue</span>
              <input className={FIELD} value={draft.venue} onChange={(e) => patch({ venue: e.target.value })} placeholder="The Theatre Showcase" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Location</span>
              <input className={FIELD} value={draft.location_label} onChange={(e) => patch({ location_label: e.target.value })} placeholder="Bengaluru · Live online" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Date label</span>
              <input className={FIELD} value={draft.date_label} onChange={(e) => patch({ date_label: e.target.value })} placeholder="Details soon · May 6, 2026" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Starts</span>
              <input type="datetime-local" className={FIELD} value={draft.starts_at} onChange={(e) => patch({ starts_at: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Ends</span>
              <input type="datetime-local" className={FIELD} value={draft.ends_at} onChange={(e) => patch({ ends_at: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">CTA label</span>
              <input className={FIELD} value={draft.cta_label} onChange={(e) => patch({ cta_label: e.target.value })} placeholder="Coming soon · Register" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Link</span>
              <input className={FIELD} value={draft.href} onChange={(e) => patch({ href: e.target.value })} placeholder="/events/… or https://" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Description</span>
              <textarea className={`${FIELD} min-h-[5.5rem]`} value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Poster URL</span>
              <div className="mt-2 flex flex-wrap gap-2">
                <input className={`${FIELD} mt-0 flex-1`} value={draft.image_url} onChange={(e) => patch({ image_url: e.target.value })} placeholder="https://…" />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="border border-white/30 px-4 py-2.5 text-sm hover:border-white disabled:opacity-40"
                >
                  Upload
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onPickFile(f);
                  }}
                />
              </div>
              {draft.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.image_url} alt="" className="mt-3 max-h-40 border border-white/15 object-cover" />
              ) : null}
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={draft.published} onChange={(e) => patch({ published: e.target.checked })} />
              Published
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Sort order</span>
              <input
                type="number"
                className={FIELD}
                value={draft.sort_order}
                onChange={(e) => patch({ sort_order: Number(e.target.value) || 0 })}
              />
            </label>
          </div>

          {err ? <p className="mt-4 text-sm text-red-300">{err}</p> : null}
          {msg ? <p className="mt-4 text-sm text-emerald-300">{msg}</p> : null}

          <div className="mt-6">
            <button type="button" disabled={busy} onClick={() => void save()} className={BTN}>
              {busy ? "Saving…" : draft.id ? "Save changes" : "Publish event"}
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">LISTINGS · {events.length}</p>
          {events.length === 0 && !err ? (
            <p className="text-sm text-white/50">No events yet. Add YAIL 01 above, or run the SQL seed.</p>
          ) : null}
          <ul className="space-y-3">
            {events.map((ev) => (
              <li key={ev.id} className="flex flex-wrap items-center justify-between gap-3 border border-white/15 bg-black/40 px-4 py-4">
                <div className="min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.2em] text-blue-400">
                    {String(ev.sort_order).padStart(2, "0")} · {studioEventTypeLabel(ev.event_type).toUpperCase()}
                    {!ev.published ? " · DRAFT" : ""}
                  </p>
                  <p className="mt-1 truncate font-heading text-lg leading-tight">{ev.title}</p>
                  {ev.subtitle ? <p className="mt-0.5 text-sm text-white/55">{ev.subtitle}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => edit(ev)} className="border border-white/30 px-3 py-1.5 text-xs hover:border-white">
                    Edit
                  </button>
                  <button type="button" onClick={() => void togglePublished(ev)} className="border border-white/30 px-3 py-1.5 text-xs hover:border-white">
                    {ev.published ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" onClick={() => void remove(ev)} className="border border-red-400/40 px-3 py-1.5 text-xs text-red-300 hover:border-red-300">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
