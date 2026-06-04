import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetIndustryById } from "@/lib/industries/load";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "name",
  "question",
  "answer",
  "tagline",
  "description",
  "hero_image_url",
  "hero_media_type",
  "hero_aspect_ratio",
  "hero_poster_url",
  "hero_caption",
  "cover_image_url",
  "cover_media_type",
  "cover_aspect_ratio",
  "cover_poster_url",
  "icon_label",
  "sort_order",
  "published",
];

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const industry = await adminGetIndustryById(id);
  if (!industry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ industry });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const patch = Object.fromEntries(
    Object.entries((await req.json()) as Record<string, unknown>).filter(([k]) => ALLOWED.includes(k))
  );
  const db = createServiceRoleClient();
  const { data: row, error } = await db.from("industries").update(patch).eq("id", id).select("slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const slug = row?.slug as string | undefined;
  if (slug) {
    revalidatePath("/industries");
    revalidatePath(`/industries/${slug}`);
    revalidatePath(`/industries/${slug}`, "page");
  }
  return NextResponse.json({ ok: true });
}
