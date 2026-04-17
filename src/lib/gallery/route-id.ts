type HasIdAndTitle = { id?: string; title: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Stable route key for public URLs; prefers DB id when present. */
export function galleryRouteId(item: HasIdAndTitle, index: number): string {
  if (item.id) return item.id;
  const base = slugify(item.title) || "item";
  return `${base}-${index + 1}`;
}

export function findGalleryIndexByRouteId<T extends HasIdAndTitle>(items: T[], routeId: string): number {
  return items.findIndex((item, index) => galleryRouteId(item, index) === routeId);
}
