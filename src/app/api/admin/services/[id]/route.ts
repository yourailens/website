import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { loadAdminService, replaceServiceGallery } from "@/lib/services/load";
import type { ServiceGalleryItem } from "@/data/services";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const service = await loadAdminService(id);
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ service });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const b = (await req.json()) as Record<string, unknown>;
  const gallery = b.gallery;
  delete b.gallery;
  delete b.id;
  delete b.created_at;
  delete b.updated_at;

  const { error } = await createServiceRoleClient().from("services").update(b).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(gallery)) {
    try {
      await replaceServiceGallery(
        id,
        (gallery as Partial<ServiceGalleryItem>[])
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
          )
      );
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Gallery save failed" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("services").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
