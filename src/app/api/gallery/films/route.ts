import { NextResponse } from "next/server";
import { getGalleryFilms } from "@/lib/gallery/load";
import { galleryRouteId } from "@/lib/gallery/route-id";

export const runtime = "nodejs";

export async function GET() {
  const films = await getGalleryFilms();
  // Only send what the marquee needs.
  const payload = films.map((f, i) => ({
    id: f.id ?? galleryRouteId(f, i),
    src: f.src,
    posterUrl: f.posterUrl ?? null,
    title: f.title,
    href: `/films/${encodeURIComponent(galleryRouteId(f, i))}`,
  }));
  return NextResponse.json({ films: payload });
}

