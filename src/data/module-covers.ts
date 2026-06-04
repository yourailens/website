export const MODULE_COVER_ASPECTS = [
  { id: "portrait", label: "3:4", hint: "Portrait cards", ratio: 3 / 4, className: "aspect-[3/4]" },
  { id: "square", label: "1:1", hint: "Square tiles", ratio: 1, className: "aspect-square" },
  { id: "landscape", label: "16:9", hint: "Hero / hub", ratio: 16 / 9, className: "aspect-[16/10]" },
  { id: "wide", label: "21:9", hint: "Cinematic wide", ratio: 21 / 9, className: "aspect-[21/9]" },
  { id: "story", label: "9:16", hint: "Stories / Reels", ratio: 9 / 16, className: "aspect-[9/16]" },
] as const;

export type ModuleCoverAspectId = (typeof MODULE_COVER_ASPECTS)[number]["id"];

export type CoverVariantEntry = {
  url: string;
  media_type: "image" | "video";
};

export type ModuleCoverVariants = Partial<Record<ModuleCoverAspectId, CoverVariantEntry>>;

function parseCoverEntry(v: unknown): CoverVariantEntry | null {
  if (typeof v === "string" && v.trim()) return { url: v.trim(), media_type: "image" };
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    const url = typeof o.url === "string" ? o.url.trim() : "";
    if (!url) return null;
    const media_type = o.media_type === "video" ? "video" : "image";
    return { url, media_type };
  }
  return null;
}

export function parseCoverVariants(raw: unknown): ModuleCoverVariants {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: ModuleCoverVariants = {};
  for (const a of MODULE_COVER_ASPECTS) {
    const entry = parseCoverEntry((raw as Record<string, unknown>)[a.id]);
    if (entry) out[a.id] = entry;
  }
  return out;
}

export function coverAspectClass(id: ModuleCoverAspectId | string): string {
  return MODULE_COVER_ASPECTS.find((a) => a.id === id)?.className ?? "aspect-[16/10]";
}

/** Primary cover URL for display (variant for chosen aspect, then legacy single URL). */
export function getCoverForAspect(
  mod: {
    cover_aspect: string;
    cover_image_url: string | null;
    cover_variants: ModuleCoverVariants;
  },
  aspect?: ModuleCoverAspectId
): CoverVariantEntry | null {
  const variants = mod.cover_variants ?? {};
  const id = (aspect ?? mod.cover_aspect) as ModuleCoverAspectId;
  if (variants[id]?.url) return variants[id]!;
  if (mod.cover_image_url?.trim() && id === mod.cover_aspect) {
    return { url: mod.cover_image_url.trim(), media_type: "image" };
  }
  for (const a of MODULE_COVER_ASPECTS) {
    if (variants[a.id]?.url) return variants[a.id]!;
  }
  return null;
}

export function getModuleCoverUrl(mod: {
  cover_aspect: string;
  cover_image_url: string | null;
  cover_variants: ModuleCoverVariants;
}): string | null {
  return getCoverForAspect(mod)?.url ?? null;
}

export function syncPrimaryCover(
  variants: ModuleCoverVariants,
  primary: ModuleCoverAspectId
): { cover_image_url: string | null; cover_variants: ModuleCoverVariants } {
  const url = variants[primary]?.url?.trim() ?? null;
  const first =
    url ??
    MODULE_COVER_ASPECTS.map((a) => variants[a.id]?.url?.trim()).find(Boolean) ??
    null;
  return { cover_image_url: first, cover_variants: variants };
}
