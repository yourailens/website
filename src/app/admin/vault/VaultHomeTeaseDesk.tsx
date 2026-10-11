"use client";

import { useEffect, useMemo, useState } from "react";
import type { YailVaultCategory, YailVaultEntry } from "@/data/yail-vault";
import { yailVaultCategoryLabel } from "@/data/yail-vault";

const MAX = 6;
const BUBBLE =
  "rounded-[1.35rem] border border-white/12 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)] sm:p-5";

function thumbOf(entry: YailVaultEntry) {
  return entry.poster_url?.trim() || (entry.media_type === "image" ? entry.media_url : "");
}

function RowEditor({
  label,
  category,
  selectedIds,
  pool,
  onChange,
}: {
  label: string;
  category: YailVaultCategory;
  selectedIds: string[];
  pool: YailVaultEntry[];
  onChange: (ids: string[]) => void;
}) {
  const byId = useMemo(() => new Map(pool.map((e) => [e.id, e])), [pool]);
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean) as YailVaultEntry[];
  const available = pool.filter((e) => !selectedIds.includes(e.id));

  function move(id: string, dir: -1 | 1) {
    const i = selectedIds.indexOf(id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  function add(id: string) {
    if (selectedIds.length >= MAX || selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
  }

  return (
    <section className={BUBBLE}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-sky-300/80">
            Homepage · {category === "filmmaking" ? "Row 1" : "Row 2"}
          </p>
          <h3 className="mt-1.5 font-heading text-xl tracking-tight">{label}</h3>
          <p className="mt-1.5 text-sm text-white/45">
            Up to {MAX} cuts. Order here is left→right on the tilted wall.
          </p>
        </div>
        <p className="font-mono text-[11px] tabular-nums text-white/40">
          {selectedIds.length}/{MAX}
        </p>
      </div>

      <ul className="mt-5 space-y-2">
        {selected.map((entry, i) => {
          const thumb = thumbOf(entry);
          return (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-2.5"
            >
              <span className="w-5 shrink-0 text-center font-mono text-[10px] text-white/35">
                {i + 1}
              </span>
              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-[8px] text-white/30">
                    VID
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{entry.title}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                  {entry.published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(entry.id, -1)}
                  disabled={i === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition hover:text-white disabled:opacity-25"
                  aria-label="Move earlier"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(entry.id, 1)}
                  disabled={i === selected.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition hover:text-white disabled:opacity-25"
                  aria-label="Move later"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  className="ml-1 rounded-lg border border-white/12 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:border-rose-400/40 hover:text-rose-200"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
        {!selected.length ? (
          <li className="rounded-2xl border border-dashed border-white/12 px-4 py-6 text-center text-sm text-white/40">
            No cuts picked — homepage will fall back to the newest {category} labs.
          </li>
        ) : null}
      </ul>

      <div className="mt-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Add from vault</p>
        <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {available.map((entry) => {
            const thumb = thumbOf(entry);
            const full = selectedIds.length >= MAX;
            return (
              <button
                key={entry.id}
                type="button"
                disabled={full || !entry.published}
                onClick={() => add(entry.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <div className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">{entry.title}</span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-sky-300/70">
                  {full ? "Full" : entry.published ? "Add" : "Draft"}
                </span>
              </button>
            );
          })}
          {!available.length ? (
            <p className="px-1 py-3 text-sm text-white/35">All {label} cuts are already in this row.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type Props = {
  entries: YailVaultEntry[];
  onSaved: (entries: YailVaultEntry[]) => void;
};

export default function VaultHomeTeaseDesk({ entries, onSaved }: Props) {
  const initialFilm = useMemo(
    () =>
      entries
        .filter((e) => e.category === "filmmaking" && e.home_tease)
        .sort((a, b) => a.home_tease_order - b.home_tease_order)
        .map((e) => e.id),
    [entries]
  );
  const initialAds = useMemo(
    () =>
      entries
        .filter((e) => e.category === "ads" && e.home_tease)
        .sort((a, b) => a.home_tease_order - b.home_tease_order)
        .map((e) => e.id),
    [entries]
  );

  const [filmmakingIds, setFilmmakingIds] = useState(initialFilm);
  const [adsIds, setAdsIds] = useState(initialAds);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Sync when parent reloads entries after save / first load
  const filmKey = initialFilm.join("|");
  const adsKey = initialAds.join("|");
  useEffect(() => {
    setFilmmakingIds(filmKey ? filmKey.split("|") : []);
    setAdsIds(adsKey ? adsKey.split("|") : []);
  }, [filmKey, adsKey]);

  const filmPool = useMemo(
    () => entries.filter((e) => e.category === "filmmaking"),
    [entries]
  );
  const adsPool = useMemo(() => entries.filter((e) => e.category === "ads"), [entries]);

  async function save() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/yail-vault/home-tease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filmmakingIds, adsIds }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        entries?: YailVaultEntry[];
      };
      if (!res.ok) {
        setErr(json.error || "Could not save homepage tease.");
        return;
      }
      if (json.entries) onSaved(json.entries);
      setMsg("Homepage vault rows updated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className={BUBBLE}>
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-emerald-300/80">
          Homepage promo
        </p>
        <h2 className="mt-1.5 font-heading text-2xl leading-none tracking-tight">
          Vault tilted tile rows
        </h2>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-white/50">
          Choose which lab cuts appear in the YAIL Vault tease on the main homepage — filmmaking on
          the first row, ads on the second. Leave a row empty to auto-fill with the newest cuts.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="rounded-full bg-white px-5 py-2.5 text-[12px] font-semibold text-black transition hover:bg-sky-100 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save homepage rows"}
          </button>
          {msg ? <p className="text-sm text-emerald-300/90">{msg}</p> : null}
          {err ? <p className="text-sm text-rose-300/90">{err}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RowEditor
          label={yailVaultCategoryLabel("filmmaking")}
          category="filmmaking"
          selectedIds={filmmakingIds}
          pool={filmPool}
          onChange={setFilmmakingIds}
        />
        <RowEditor
          label={yailVaultCategoryLabel("ads")}
          category="ads"
          selectedIds={adsIds}
          pool={adsPool}
          onChange={setAdsIds}
        />
      </div>
    </div>
  );
}
