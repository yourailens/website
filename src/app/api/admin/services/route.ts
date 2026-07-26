import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { loadAdminServices, replaceServiceGallery } from "@/lib/services/load";
import type { ServiceGalleryItem } from "@/data/services";

export const dynamic = "force-dynamic";

function galleryFromBody(gallery: unknown) {
  if (!Array.isArray(gallery)) return null;
  return (gallery as Partial<ServiceGalleryItem>[])
    .map((item, i) => ({
      media_type: item.media_type === "video" ? ("video" as const) : ("image" as const),
      image_url: typeof item.image_url === "string" ? item.image_url : null,
      video_url: typeof item.video_url === "string" ? item.video_url : null,
      poster_url: typeof item.poster_url === "string" ? item.poster_url : null,
      caption: typeof item.caption === "string" ? item.caption : null,
      sort_order: typeof item.sort_order === "number" ? item.sort_order : i,
    }))
    .filter(
      (item) =>
        (item.media_type === "image" && item.image_url) ||
        (item.media_type === "video" && item.video_url)
    );
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ services: await loadAdminServices() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as Record<string, unknown>;
  const gallery = galleryFromBody(b.gallery);
  delete b.gallery;
  delete b.id;
  delete b.created_at;
  delete b.updated_at;

  const { data, error } = await createServiceRoleClient()
    .from("services")
    .insert(b)
    .select("id,slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (gallery && data?.id) {
    try {
      await replaceServiceGallery(String(data.id), gallery);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Gallery save failed" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
