"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMMUNITY_PLACEMENTS,
  communityPlacementLabel,
  type CommunityFrame,
  type CommunityPiece,
  type CommunityPlacement,
  type CommunitySite,
} from "@/data/community";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40";
const BUBBLE =
  "rounded-[1.35rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-4 sm:p-5";
const CHIP =
  "rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70 disabled:opacity-40";

function UploadSlot({
  uploading,
  fileName,
  label,
  onPick,
}: {
  uploading: boolean;
  fileName: string;
  label: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={uploading}
      onClick={onPick}
      className="relative mt-3 w-full overflow-hidden rounded-full border border-dashed border-white/25 py-3 text-sm text-white/80 disabled:cursor-wait disabled:border-sky-300/50 disabled:text-white"
    >
      {uploading ? (
        <span className="flex items-center justify-center gap-3 px-4">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white" aria-hidden />
          <span className="truncate">Uploading {fileName}…</span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-white/10" aria-hidden>
            <span
              className="absolute inset-y-0 w-1/3 bg-sky-300"
              style={{ animation: "community-upload-slide 1.1s ease-in-out infinite" }}
            />
          </span>
          <style>{`@keyframes community-upload-slide { 0% { transform: translateX(-120%); } 100% { transform: translateX(340%); } }`}</style>
        </span>
      ) : (
        label
      )}
    </button>
  );
}

const EMPTY_SITE: CommunitySite = {
  id: 1,
  eyebrow: "YAIL",
  title: "AI Creators Community",
  lede: "A home for people making films, ads, and worlds with generative media.",
  member_count: 180,
  member_label: "members",
  cta_label: "Show your interest",
  updated_at: "",
};

async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/community/upload-media", { method: "POST", body: fd });
  const j = (await res.json().catch(() => ({}))) as {
    url?: string;
    media_type?: "image" | "video";
    poster_url?: string | null;
    frame_stills?: CommunityFrame[];
    error?: string;
  };
  if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
  return j;
}

function sortedPieces(pieces: CommunityPiece[]) {
  return [...pieces].sort((a, b) => b.sort_order - a.sort_order || b.created_at.localeCompare(a.created_at));
}

function homepagePieces(pieces: CommunityPiece[]) {
  return sortedPieces(pieces.filter((piece) => piece.show_on_home && piece.published));
}

function HomeOrder({
  pieces,
  busy,
  onMove,
}: {
  pieces: CommunityPiece[];
  busy: boolean;
  onMove: (piece: CommunityPiece, dir: -1 | 1) => void;
}) {
  const home = homepagePieces(pieces);

  return (
    <section className={BUBBLE}>
      <h2 className="font-heading text-2xl tracking-tight">Homepage row</h2>
      <p className="mt-2 max-w-xl text-sm text-white/50">
        Order of the community pieces on the homepage. The top of this list is first. Mark a piece Home in its section to include it.
      </p>
      {home.length ? (
        <ol className="mt-5 space-y-2">
          {home.map((piece, index) => (
            <li key={piece.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
              <span className="w-6 font-mono text-xs text-white/40">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-white">{piece.title}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                {communityPlacementLabel(piece.placement)}
              </span>
              <button type="button" className={CHIP} disabled={busy || index === 0} onClick={() => onMove(piece, -1)}>
                Up
              </button>
              <button
                type="button"
                className={CHIP}
                disabled={busy || index === home.length - 1}
                onClick={() => onMove(piece, 1)}
              >
                Down
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-white/45">Nothing is on the homepage row yet.</p>
      )}
    </section>
  );
}

export default function CommunityDesk() {
  const [site, setSite] = useState<CommunitySite>(EMPTY_SITE);
  const [pieces, setPieces] = useState<CommunityPiece[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [siteRes, piecesRes] = await Promise.all([
      fetch("/api/admin/community/site"),
      fetch("/api/admin/community/pieces"),
    ]);
    const siteJson = (await siteRes.json().catch(() => ({}))) as { site?: CommunitySite; error?: string };
    const piecesJson = (await piecesRes.json().catch(() => ({}))) as { pieces?: CommunityPiece[]; error?: string };
    if (!siteRes.ok) setErr(siteJson.error || "Could not load the community page.");
    else setSite({ ...EMPTY_SITE, ...(siteJson.site ?? {}) });
    if (!piecesRes.ok && piecesJson.error) setErr(piecesJson.error);
    setPieces(piecesJson.pieces ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function movePiece(piece: CommunityPiece, dir: -1 | 1) {
    const home = homepagePieces(pieces);
    const homeIndex = home.findIndex((item) => item.id === piece.id);
    const pool = homeIndex >= 0 ? home : sortedPieces(pieces.filter((item) => item.placement === piece.placement));
    const index = pool.findIndex((item) => item.id === piece.id);
    const neighbor = pool[index + dir];
    if (!neighbor) return;
    let nextOrder = neighbor.sort_order;
    let neighborOrder = piece.sort_order;
    if (nextOrder === neighborOrder) nextOrder = dir < 0 ? neighborOrder + 1 : neighborOrder - 1;
    setErr("");
    setMsg("");
    setPieces((current) =>
      sortedPieces(
        current.map((item) => {
          if (item.id === piece.id) return { ...item, sort_order: nextOrder };
          if (item.id === neighbor.id) return { ...item, sort_order: neighborOrder };
          return item;
        }),
      ),
    );
    setBusy(true);
    try {
      let latest: CommunityPiece[] | null = null;
      for (const [id, sort_order] of [
        [piece.id, nextOrder],
        [neighbor.id, neighborOrder],
      ] as const) {
        const res = await fetch(`/api/admin/community/pieces/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order }),
        });
        const json = (await res.json().catch(() => ({}))) as { pieces?: CommunityPiece[]; error?: string };
        if (!res.ok) throw new Error(json.error || "Could not save the order.");
        latest = json.pieces ?? latest;
      }
      if (latest) setPieces(latest);
      setMsg("Order saved.");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not save the order.");
      const res = await fetch("/api/admin/community/pieces");
      const json = (await res.json().catch(() => ({}))) as { pieces?: CommunityPiece[] };
      if (json.pieces) setPieces(json.pieces);
    } finally {
      setBusy(false);
    }
  }

  async function saveSite() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/community/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      const j = (await res.json().catch(() => ({}))) as { site?: CommunitySite; error?: string };
      if (!res.ok) throw new Error(j.error || "Save failed");
      setSite({ ...EMPTY_SITE, ...(j.site ?? site) });
      setMsg("Page copy saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80">Community</p>
          <h1 className="mt-2 font-heading text-3xl tracking-tight">AI Creators Community</h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Page copy, member count, and every image or video used as a hero, jumbotron, or gallery piece.
          </p>
        </div>
        <Link
          href="/ai-verse"
          className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70"
        >
          View page
        </Link>
      </div>
      {err ? <p className="text-sm text-rose-300/90">{err}</p> : null}
      {msg ? <p className="text-sm text-emerald-300/90">{msg}</p> : null}

      <section className={BUBBLE}>
        <h2 className="font-heading text-2xl tracking-tight">Page</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-white/45">
            Eyebrow
            <input className={`${FIELD} mt-1.5`} value={site.eyebrow} onChange={(e) => setSite({ ...site, eyebrow: e.target.value })} />
          </label>
          <label className="block text-xs text-white/45">
            Heading
            <input className={`${FIELD} mt-1.5`} value={site.title} onChange={(e) => setSite({ ...site, title: e.target.value })} />
          </label>
          <label className="block text-xs text-white/45">
            Member count
            <input
              className={`${FIELD} mt-1.5`}
              type="number"
              min={0}
              value={site.member_count}
              onChange={(e) => setSite({ ...site, member_count: Number(e.target.value) })}
            />
          </label>
          <label className="block text-xs text-white/45">
            Count label
            <input className={`${FIELD} mt-1.5`} value={site.member_label} onChange={(e) => setSite({ ...site, member_label: e.target.value })} />
          </label>
          <label className="block text-xs text-white/45 sm:col-span-2">
            Lede
            <textarea className={`${FIELD} mt-1.5 min-h-20`} value={site.lede ?? ""} onChange={(e) => setSite({ ...site, lede: e.target.value })} />
          </label>
          <label className="block text-xs text-white/45 sm:col-span-2">
            Interest button
            <input className={`${FIELD} mt-1.5`} value={site.cta_label} onChange={(e) => setSite({ ...site, cta_label: e.target.value })} />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveSite()}
          className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          Save page
        </button>
      </section>

      <PieceComposer
        busy={busy}
        setBusy={setBusy}
        setErr={setErr}
        setMsg={setMsg}
        onChange={setPieces}
      />

      <HomeOrder pieces={pieces} busy={busy} onMove={(piece, dir) => void movePiece(piece, dir)} />

      {COMMUNITY_PLACEMENTS.map((placement) => (
        <PieceList
          key={placement}
          placement={placement}
          pieces={pieces.filter((piece) => piece.placement === placement)}
          allPieces={pieces}
          busy={busy}
          setBusy={setBusy}
          setErr={setErr}
          setMsg={setMsg}
          onChange={setPieces}
          onMove={(piece, dir) => void movePiece(piece, dir)}
        />
      ))}
    </div>
  );
}

function PieceComposer({
  busy,
  setBusy,
  setErr,
  setMsg,
  onChange,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  setErr: (v: string) => void;
  setMsg: (v: string) => void;
  onChange: (pieces: CommunityPiece[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    placement: "gallery" as CommunityPlacement,
    media_type: "image" as "image" | "video",
    media_url: "",
    poster_url: "",
    frame_stills: [] as CommunityFrame[],
    show_on_home: true,
    published: true,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");

  async function create() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/community/pieces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await res.json().catch(() => ({}))) as { pieces?: CommunityPiece[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Could not add that piece");
      onChange(j.pieces ?? []);
      setDraft({
        title: "",
        description: "",
        placement: "gallery",
        media_type: "image",
        media_url: "",
        poster_url: "",
        frame_stills: [],
        show_on_home: true,
        published: true,
      });
      setMsg("Piece added.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not add that piece");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={BUBBLE}>
      <h2 className="font-heading text-2xl tracking-tight">Add media</h2>
      <p className="mt-2 text-sm text-white/50">
        Hero opens the page. Jumbotron is a full-bleed section. Gallery is the grid with captions.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input className={FIELD} placeholder="Caption" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <select className={FIELD} value={draft.placement} onChange={(e) => setDraft({ ...draft, placement: e.target.value as CommunityPlacement })}>
          {COMMUNITY_PLACEMENTS.map((placement) => (
            <option key={placement} value={placement}>{communityPlacementLabel(placement)}</option>
          ))}
        </select>
      </div>
      <textarea
        className={`${FIELD} mt-3 min-h-20`}
        placeholder="Description"
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setUploading(true);
          setUploadName(file.name);
          setErr("");
          void uploadFile(file)
            .then((up) =>
              setDraft((d) => ({
                ...d,
                media_url: up.url!,
                media_type: up.media_type ?? "image",
                poster_url: up.poster_url ?? "",
                frame_stills: up.frame_stills ?? [],
                title: d.title || file.name.replace(/\.[^.]+$/, ""),
              }))
            )
            .catch((er) => setErr(er instanceof Error ? er.message : "Upload failed"))
            .finally(() => setUploading(false));
        }}
      />
      <UploadSlot
        uploading={uploading}
        fileName={uploadName}
        label={draft.media_url ? `Ready · ${draft.media_type}` : "Upload image or video"}
        onPick={() => fileRef.current?.click()}
      />
      <label className="mt-3 flex items-center gap-2 text-xs text-white/60">
        <input type="checkbox" checked={draft.show_on_home} onChange={(e) => setDraft({ ...draft, show_on_home: e.target.checked })} />
        Show on the homepage community row
      </label>
      <button
        type="button"
        disabled={busy || uploading || !draft.title.trim() || !draft.media_url}
        onClick={() => void create()}
        className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
      >
        Publish piece
      </button>
    </section>
  );
}

function PieceList({
  placement,
  pieces,
  allPieces,
  busy,
  setBusy,
  setErr,
  setMsg,
  onChange,
  onMove,
}: {
  placement: CommunityPlacement;
  pieces: CommunityPiece[];
  allPieces: CommunityPiece[];
  busy: boolean;
  setBusy: (v: boolean) => void;
  setErr: (v: string) => void;
  setMsg: (v: string) => void;
  onChange: (pieces: CommunityPiece[]) => void;
  onMove: (piece: CommunityPiece, dir: -1 | 1) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [edit, setEdit] = useState({
    title: "",
    description: "",
    placement,
    media_type: "image" as "image" | "video",
    media_url: "",
    poster_url: "",
    frame_stills: [] as CommunityFrame[],
  });
  const fileRef = useRef<HTMLInputElement>(null);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/community/pieces/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { pieces?: CommunityPiece[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Update failed");
      onChange(j.pieces ?? []);
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this piece?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/community/pieces/${id}`, { method: "DELETE" });
      const j = (await res.json().catch(() => ({}))) as { pieces?: CommunityPiece[]; error?: string };
      if (!res.ok) throw new Error(j.error || "Delete failed");
      onChange(j.pieces ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(piece: CommunityPiece) {
    setEditingId(piece.id);
    setEdit({
      title: piece.title,
      description: piece.description ?? "",
      placement: piece.placement,
      media_type: piece.media_type,
      media_url: piece.media_url,
      poster_url: piece.poster_url ?? "",
      frame_stills: piece.frame_stills ?? [],
    });
  }

  async function saveEdit() {
    if (!editingId || !edit.title.trim() || !edit.media_url.trim()) return;
    const ok = await patch(editingId, edit);
    if (ok) {
      setMsg("Piece updated.");
      setEditingId(null);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
          {communityPlacementLabel(placement)}
        </h2>
        <span className="text-xs text-white/30">{pieces.length}</span>
      </div>
      {!pieces.length ? <p className="text-sm text-white/35">Nothing in this section yet.</p> : null}
      <ul className="space-y-3">
        {pieces.map((piece) => {
          const open = editingId === piece.id;
          const home = homepagePieces(allPieces);
          const homeIndex = home.findIndex((item) => item.id === piece.id);
          const pool = homeIndex >= 0 ? home : pieces;
          const poolIndex = pool.findIndex((item) => item.id === piece.id);
          return (
            <li key={piece.id} className={BUBBLE}>
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative h-28 w-full overflow-hidden rounded-xl bg-black lg:w-48">
                  {piece.media_type === "video" ? (
                    <video src={piece.media_url} poster={piece.poster_url ?? undefined} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={piece.media_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{piece.title}</p>
                  {homeIndex >= 0 ? (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-sky-300/80">
                      Homepage {String(homeIndex + 1).padStart(2, "0")}
                    </p>
                  ) : null}
                  {piece.description ? <p className="mt-1 text-sm text-white/50">{piece.description}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={busy || poolIndex <= 0} onClick={() => onMove(piece, -1)} className={CHIP}>Up</button>
                    <button type="button" disabled={busy || poolIndex < 0 || poolIndex >= pool.length - 1} onClick={() => onMove(piece, 1)} className={CHIP}>Down</button>
                    <button type="button" disabled={busy} onClick={() => (open ? setEditingId(null) : beginEdit(piece))} className={CHIP}>
                      {open ? "Close" : "Edit"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => void patch(piece.id, { show_on_home: !piece.show_on_home })} className={CHIP}>
                      {piece.show_on_home ? "Home ✓" : "Home"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => void patch(piece.id, { published: !piece.published })} className={CHIP}>
                      {piece.published ? "Live" : "Draft"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => void remove(piece.id)} className="rounded-full border border-rose-400/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-rose-200/80">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              {open ? (
                <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className={FIELD} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                    <select className={FIELD} value={edit.placement} onChange={(e) => setEdit({ ...edit, placement: e.target.value as CommunityPlacement })}>
                      {COMMUNITY_PLACEMENTS.map((item) => (
                        <option key={item} value={item}>{communityPlacementLabel(item)}</option>
                      ))}
                    </select>
                  </div>
                  <textarea className={`${FIELD} min-h-20`} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setUploading(true);
                      setUploadName(file.name);
                      setErr("");
                      void uploadFile(file)
                        .then((up) =>
                          setEdit((d) => ({
                            ...d,
                            media_url: up.url!,
                            media_type: up.media_type ?? "image",
                            poster_url: up.poster_url ?? d.poster_url,
                            frame_stills: up.frame_stills ?? d.frame_stills,
                          }))
                        )
                        .catch((er) => setErr(er instanceof Error ? er.message : "Upload failed"))
                        .finally(() => setUploading(false));
                    }}
                  />
                  <UploadSlot
                    uploading={uploading}
                    fileName={uploadName}
                    label="Replace image or video"
                    onPick={() => fileRef.current?.click()}
                  />
                  <div className="flex gap-2">
                    <button type="button" disabled={busy || uploading} onClick={() => void saveEdit()} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
                      Save piece
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className={CHIP}>Cancel</button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
