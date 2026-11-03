import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isCommunityPlacement, parseCommunityFrames } from "@/data/community";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllCommunityPieces } from "@/lib/community/load";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function revalidate(id?: string) {
  revalidatePath("/");
  revalidatePath("/ai-verse");
  revalidatePath("/ai-verse/[id]", "page");
  if (id) revalidatePath(`/ai-verse/${id}`);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") patch.title = b.title.trim();
  if (isCommunityPlacement(b.placement)) patch.placement = b.placement;
  if (b.media_type === "image" || b.media_type === "video") patch.media_type = b.media_type;
  if ("description" in b) patch.description = String(b.description ?? "").trim() || null;
  if ("media_url" in b) patch.media_url = String(b.media_url ?? "").trim();
  if ("poster_url" in b) patch.poster_url = String(b.poster_url ?? "").trim() || null;
  if ("frame_stills" in b) patch.frame_stills = parseCommunityFrames(b.frame_stills);
  if (typeof b.show_on_home === "boolean") patch.show_on_home = b.show_on_home;
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.round(b.sort_order);
  }
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const db = createServiceRoleClient();
  let { error } = await db.from("community_pieces").update(patch).eq("id", id);
  if (error && /frame_stills/i.test(error.message) && "frame_stills" in patch) {
    const { frame_stills: _frames, ...withoutFrames } = patch;
    ({ error } = await db.from("community_pieces").update(withoutFrames).eq("id", id));
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate(id);
  return NextResponse.json({ pieces: await adminGetAllCommunityPieces() });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("community_pieces").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate(id);
  return NextResponse.json({ pieces: await adminGetAllCommunityPieces() });
}
