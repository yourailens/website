import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const { playbook_id, title, caption, media_url, media_type, poster_url, aspect_ratio, service_slug, sort_order, published } =
    b;
  if (!playbook_id || !title || !media_url) {
    return NextResponse.json({ error: "playbook_id, title, media_url required" }, { status: 400 });
  }
  const { data, error } = await createServiceRoleClient()
    .from("industry_playbook_examples")
    .insert({
      playbook_id,
      title,
      caption: caption ?? null,
      media_url,
      media_type: media_type ?? "image",
      poster_url: poster_url ?? null,
      aspect_ratio: aspect_ratio ?? "landscape",
      service_slug: service_slug ?? null,
      sort_order: sort_order ?? 0,
      published: published ?? false,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id });
}
