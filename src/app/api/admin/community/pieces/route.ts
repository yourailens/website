import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isCommunityPlacement, parseCommunityFrames } from "@/data/community";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllCommunityPieces, nextCommunitySortOrder } from "@/lib/community/load";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/ai-verse");
  revalidatePath("/ai-verse/[id]", "page");
}

const MISSING = "Run supabase/migrations/107_community.sql in the Supabase SQL editor first.";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ pieces: await adminGetAllCommunityPieces() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load community media" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const media_url = String(b.media_url ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!media_url) return NextResponse.json({ error: "Upload an image or video first" }, { status: 400 });
  const placement = isCommunityPlacement(b.placement) ? b.placement : "gallery";
  const media_type = b.media_type === "video" ? "video" : "image";
  const db = createServiceRoleClient();
  const sort_order = await nextCommunitySortOrder();
  const row = {
    title,
    description: String(b.description ?? "").trim() || null,
    placement,
    media_type,
    media_url,
    poster_url: String(b.poster_url ?? "").trim() || null,
    frame_stills: parseCommunityFrames(b.frame_stills),
    show_on_home: b.show_on_home !== false,
    published: b.published !== false,
    sort_order,
  };
  let { error } = await db.from("community_pieces").insert(row);
  if (error && /frame_stills/i.test(error.message)) {
    const { frame_stills: _frames, ...withoutFrames } = row;
    ({ error } = await db.from("community_pieces").insert(withoutFrames));
  }
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json({ error: missing ? MISSING : error.message }, { status: 400 });
  }
  revalidate();
  return NextResponse.json({ pieces: await adminGetAllCommunityPieces() });
}
