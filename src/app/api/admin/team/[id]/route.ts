import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED = ["slug", "name", "role", "short_bio", "bio", "portrait_url", "published", "sort_order"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)));

  const db = createServiceRoleClient();
  const { error } = await db.from("studio_team_members").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(body.work)) {
    await db.from("studio_team_work").delete().eq("member_id", id);
    const inserts = (body.work as Record<string, unknown>[]).map((a, i) => ({
      member_id: id,
      media_type: a.media_type === "video" ? "video" : "image",
      image_url: a.image_url || null,
      video_url: a.video_url || null,
      poster_url: a.poster_url || null,
      aspect_ratio: a.aspect_ratio ?? "natural",
      title: a.title || null,
      caption: a.caption || null,
      sort_order: a.sort_order ?? i,
    }));
    if (inserts.length > 0) {
      const { error: workErr } = await db.from("studio_team_work").insert(inserts);
      if (workErr) return NextResponse.json({ error: workErr.message }, { status: 400 });
    }
  }

  if (Array.isArray(body.links)) {
    await db.from("studio_team_links").delete().eq("member_id", id);
    const inserts = (body.links as Record<string, unknown>[])
      .map((a, i) => ({
        member_id: id,
        label: String(a.label ?? "").trim(),
        url: String(a.url ?? "").trim(),
        sort_order: a.sort_order ?? i,
      }))
      .filter((row) => row.label && row.url);
    if (inserts.length > 0) {
      const { error: linkErr } = await db.from("studio_team_links").insert(inserts);
      if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("studio_team_members").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
