"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type {
  CharacterSheet,
  CharacterEthnicity,
  CharacterAgeGroup,
  CharacterGender,
  CharacterArchetype,
} from "@/data/character_sheets";
import {
  ALL_ETHNICITIES,
  ALL_AGE_GROUPS,
  ALL_GENDERS,
  ALL_ARCHETYPES,
  ETHNICITY_LABELS,
  ETHNICITY_ACCENTS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  ARCHETYPE_LABELS,
  ARCHETYPE_ACCENTS,
} from "@/data/character_sheets";

// ── Masonry grid ──────────────────────────────────────────────

function MasonryGrid({ sheets }: { sheets: CharacterSheet[] }) {
  if (sheets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <p className="font-heading text-lg font-bold text-slate-700">No character sheets found</p>
        <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
      {sheets.map((sheet) => (
        <CharacterCard key={sheet.id} sheet={sheet} />
      ))}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────

function CharacterCard({ sheet }: { sheet: CharacterSheet }) {
  const ethnicityAccent = ETHNICITY_ACCENTS[sheet.ethnicity];
  const archetypeAccent = ARCHETYPE_ACCENTS[sheet.archetype];

  return (
    <Link
      href={`/character-sheets/${sheet.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-slate-100">
        <Image
          src={sheet.image_url}
          alt={sheet.title}
          width={400}
          height={sheet.aspect_ratio === "portrait" ? 560 : sheet.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                View Sheet
              </span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[9px] font-semibold text-white/80 backdrop-blur-sm">
                {GENDER_LABELS[sheet.gender]}
              </span>
            </div>
          </div>
        </div>

        {/* Featured badge */}
        {sheet.featured && (
          <div className="absolute left-2 top-2">
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
              ✦ Featured
            </span>
          </div>
        )}

        {/* Age badge top-right */}
        <div className="absolute right-2 top-2">
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
            {AGE_GROUP_LABELS[sheet.age_group]}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="p-3">
        <p className="truncate text-sm font-bold text-slate-900">{sheet.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ethnicityAccent}`}>
            {ETHNICITY_LABELS[sheet.ethnicity]}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${archetypeAccent}`}>
            {ARCHETYPE_LABELS[sheet.archetype]}
          </span>
        </div>
        {sheet.nationality && (
          <p className="mt-1 text-[10px] text-slate-400 truncate">📍 {sheet.nationality}</p>
        )}
        {sheet.style_tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {sheet.style_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-slate-400">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Filter chip ───────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
        active
          ? accent
            ? `${accent} shadow-sm ring-2 ring-offset-1 ring-current/30`
            : "bg-blue-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

// ── Main experience ───────────────────────────────────────────

export default function CharacterSheetsExperience() {
  const [sheets, setSheets] = useState<CharacterSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeEthnicity, setActiveEthnicity] = useState<CharacterEthnicity | "">("");
  const [activeAgeGroup, setActiveAgeGroup] = useState<CharacterAgeGroup | "">("");
  const [activeGender, setActiveGender] = useState<CharacterGender | "">("");
  const [activeArchetype, setActiveArchetype] = useState<CharacterArchetype | "">("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchSheets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (activeEthnicity) params.set("ethnicity", activeEthnicity);
      if (activeAgeGroup)  params.set("age_group", activeAgeGroup);
      if (activeGender)    params.set("gender", activeGender);
      if (activeArchetype) params.set("archetype", activeArchetype);
      params.set("limit", "80");
      const res = await fetch(`/api/character-sheets?${params}`);
      const json = await res.json() as { character_sheets: CharacterSheet[] };
      setSheets(json.character_sheets ?? []);
    } catch { setSheets([]); }
    finally { setLoading(false); }
  }, [debouncedSearch, activeEthnicity, activeAgeGroup, activeGender, activeArchetype]);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  const hasFilter = !!(activeEthnicity || activeAgeGroup || activeGender || activeArchetype || debouncedSearch);

  function clearAll() {
    setSearch("");
    setActiveEthnicity("");
    setActiveAgeGroup("");
    setActiveGender("");
    setActiveArchetype("");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">

        {/* ── Search + filters ── */}
        <div className="border-b border-slate-200 bg-white">
          <div className="w-[95%] mx-auto pt-6 pb-4">
            {/* Search bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, nationality, hair color, tags…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
              />
              {search ? (
                <button type="button" onClick={() => setSearch("")} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              ) : (
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">⌘K</span>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-16">Gender</span>
                <FilterChip label="All" active={activeGender === ""} onClick={() => setActiveGender("")} />
                {ALL_GENDERS.map((g) => (
                  <FilterChip key={g} label={GENDER_LABELS[g]} active={activeGender === g} onClick={() => setActiveGender(activeGender === g ? "" : g)} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-16">Age</span>
                <FilterChip label="All" active={activeAgeGroup === ""} onClick={() => setActiveAgeGroup("")} />
                {ALL_AGE_GROUPS.map((a) => (
                  <FilterChip key={a} label={AGE_GROUP_LABELS[a]} active={activeAgeGroup === a} onClick={() => setActiveAgeGroup(activeAgeGroup === a ? "" : a)} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-16">Origin</span>
                <FilterChip label="All" active={activeEthnicity === ""} onClick={() => setActiveEthnicity("")} />
                {ALL_ETHNICITIES.map((e) => (
                  <FilterChip key={e} label={ETHNICITY_LABELS[e]} active={activeEthnicity === e} accent={activeEthnicity === e ? ETHNICITY_ACCENTS[e] : undefined} onClick={() => setActiveEthnicity(activeEthnicity === e ? "" : e)} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-16">Role</span>
                <FilterChip label="All" active={activeArchetype === ""} onClick={() => setActiveArchetype("")} />
                {ALL_ARCHETYPES.map((a) => (
                  <FilterChip key={a} label={ARCHETYPE_LABELS[a]} active={activeArchetype === a} accent={activeArchetype === a ? ARCHETYPE_ACCENTS[a] : undefined} onClick={() => setActiveArchetype(activeArchetype === a ? "" : a)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="w-[95%] mx-auto py-2.5">
          <p className="text-xs text-slate-400">
            {loading ? "Searching…" : `${sheets.length} result${sheets.length !== 1 ? "s" : ""}`}
            {hasFilter && !loading && (
              <button type="button" onClick={clearAll} className="ml-3 font-semibold text-blue-600 hover:underline">Clear all</button>
            )}
          </p>
        </div>

        {/* ── Masonry grid ── */}
        <div className="w-[95%] mx-auto pb-20">
          {loading ? (
            <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="mb-3 break-inside-avoid animate-pulse rounded-2xl bg-slate-200"
                  style={{ height: [320, 420, 280, 360, 300, 460, 340, 260][i % 8] }}
                />
              ))}
            </div>
          ) : (
            <MasonryGrid sheets={sheets} />
          )}
        </div>
      </div>
    </>
  );
}
