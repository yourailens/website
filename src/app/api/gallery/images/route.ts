import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/gallery/load";

export const runtime = "nodejs";

export async function GET() {
  const images = await getGalleryImages();
  const payload = images.map((img) => ({
    id: img.id,
    src: img.src,
    title: img.title,
    aspect: img.aspect ?? "square",
  }));
  return NextResponse.json({ images: payload });
}
