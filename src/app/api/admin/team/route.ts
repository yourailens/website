import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllTeamMembers } from "@/lib/team/load";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ members: await adminGetAllTeamMembers() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const slug = String(b.slug ?? slugify(name)).trim();
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("studio_team_members")
    .insert({
      slug,
      name,
      role: String(b.role ?? "").trim(),
      short_bio: typeof b.short_bio === "string" ? b.short_bio.trim() || null : null,
      bio: typeof b.bio === "string" ? b.bio.trim() || null : null,
      portrait_url: typeof b.portrait_url === "string" ? b.portrait_url.trim() || null : null,
      published: Boolean(b.published),
      sort_order: Number(b.sort_order ?? 0),
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const work = Array.isArray(b.work) ? b.work : [];
  if (work.length > 0) {
    const inserts = work.map((a: Record<string, unknown>, i: number) => ({
      member_id: data.id,
      media_type: a.media_type === "video" ? "video" : "image",
      image_url: a.image_url || null,
      video_url: a.video_url || null,
      poster_url: a.poster_url || null,
      aspect_ratio: a.aspect_ratio ?? "natural",
      title: a.title || null,
      caption: a.caption || null,
      sort_order: a.sort_order ?? i,
    }));
    const { error: workErr } = await db.from("studio_team_work").insert(inserts);
    if (workErr) return NextResponse.json({ error: workErr.message }, { status: 400 });
  }

  const links = Array.isArray(b.links) ? b.links : [];
  if (links.length > 0) {
    const inserts = links
      .map((a: Record<string, unknown>, i: number) => ({
        member_id: data.id,
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

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
