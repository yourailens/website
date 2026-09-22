"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { OttFilterChip, OttSearchInput } from "@/components/ott/OttLibraryControls";
import {
  INDUSTRY_PAGE,
  IndustryChannelTitle,
  IndustryGlow,
  IndustryShell,
} from "@/app/industries/IndustryUI";
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
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  ARCHETYPE_LABELS,
} from "@/data/character_sheets";

function MasonryGrid({ sheets }: { sheets: CharacterSheet[] }) {
  if (sheets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-white/15 py-32 text-center">
        <p className="font-body text-lg font-semibold text-white">No models found</p>
        <p className="mt-1 text-sm text-white/45">Try adjusting your search or filters</p>
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

function CharacterCard({ sheet }: { sheet: CharacterSheet }) {
  return (
    <Link
      href={`/character-sheets/${sheet.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src={sheet.image_url}
          alt={sheet.title}
          width={400}
          height={sheet.aspect_ratio === "portrait" ? 560 : sheet.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {sheet.featured && (
          <div className="absolute left-2 top-2">
            <span className="border border-blue-400/50 bg-blue-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-200">
              Featured
            </span>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <span className="border border-white/20 bg-black/50 px-2 py-0.5 font-mono text-[9px] text-white/80 backdrop-blur-sm">
            {AGE_GROUP_LABELS[sheet.age_group]}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{sheet.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {ETHNICITY_LABELS[sheet.ethnicity]}
          </span>
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
            {ARCHETYPE_LABELS[sheet.archetype]}
          </span>
        </div>
        {sheet.nationality && (
          <p className="mt-1 truncate text-[10px] text-white/40">{sheet.nationality}</p>
        )}
        {sheet.style_tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {sheet.style_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-white/40">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

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
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchSheets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (activeEthnicity) params.set("ethnicity", activeEthnicity);
      if (activeAgeGroup) params.set("age_group", activeAgeGroup);
      if (activeGender) params.set("gender", activeGender);
      if (activeArchetype) params.set("archetype", activeArchetype);
      params.set("limit", "80");
      const res = await fetch(`/api/character-sheets?${params}`);
      const json = (await res.json()) as { character_sheets: CharacterSheet[] };
      setSheets(json.character_sheets ?? []);
    } catch {
      setSheets([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeEthnicity, activeAgeGroup, activeGender, activeArchetype]);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const hasFilter = !!(
    activeEthnicity ||
    activeAgeGroup ||
    activeGender ||
    activeArchetype ||
    debouncedSearch
  );

  function clearAll() {
    setSearch("");
    setActiveEthnicity("");
    setActiveAgeGroup("");
    setActiveGender("");
    setActiveArchetype("");
  }

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Models" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Character model sheets by gender, age, origin, and archetype.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, nationality, hair color, tags…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Gender
            </span>
            <OttFilterChip label="All" active={activeGender === ""} onClick={() => setActiveGender("")} />
            {ALL_GENDERS.map((g) => (
              <OttFilterChip
                key={g}
                label={GENDER_LABELS[g]}
                active={activeGender === g}
                onClick={() => setActiveGender(activeGender === g ? "" : g)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Age
            </span>
            <OttFilterChip
              label="All"
              active={activeAgeGroup === ""}
              onClick={() => setActiveAgeGroup("")}
            />
            {ALL_AGE_GROUPS.map((a) => (
              <OttFilterChip
                key={a}
                label={AGE_GROUP_LABELS[a]}
                active={activeAgeGroup === a}
                onClick={() => setActiveAgeGroup(activeAgeGroup === a ? "" : a)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Origin
            </span>
            <OttFilterChip
              label="All"
              active={activeEthnicity === ""}
              onClick={() => setActiveEthnicity("")}
            />
            {ALL_ETHNICITIES.map((e) => (
              <OttFilterChip
                key={e}
                label={ETHNICITY_LABELS[e]}
                active={activeEthnicity === e}
                onClick={() => setActiveEthnicity(activeEthnicity === e ? "" : e)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Role
            </span>
            <OttFilterChip
              label="All"
              active={activeArchetype === ""}
              onClick={() => setActiveArchetype("")}
            />
            {ALL_ARCHETYPES.map((a) => (
              <OttFilterChip
                key={a}
                label={ARCHETYPE_LABELS[a]}
                active={activeArchetype === a}
                onClick={() => setActiveArchetype(activeArchetype === a ? "" : a)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} py-2.5`}>
        <p className="text-xs text-white/40">
          {loading ? "Searching…" : `${sheets.length} result${sheets.length !== 1 ? "s" : ""}`}
          {hasFilter && !loading && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-3 font-semibold text-blue-300 hover:underline"
            >
              Clear all
            </button>
          )}
        </p>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} pb-20`}>
        {loading ? (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 break-inside-avoid animate-pulse border border-white/10 bg-white/[0.04]"
                style={{ height: [320, 420, 280, 360, 300, 460, 340, 260][i % 8] }}
              />
            ))}
          </div>
        ) : (
          <MasonryGrid sheets={sheets} />
        )}
      </div>
    </IndustryShell>
  );
}
