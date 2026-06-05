import { NextRequest, NextResponse } from "next/server";
import { getOutfitBySlug } from "@/lib/outfits/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const outfit = await getOutfitBySlug(slug);
  if (!outfit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // bump view count async
  try {
    const db = createServiceRoleClient();
    await db.rpc("increment_outfit_view", { outfit_id: outfit.id });
  } catch {}

  return NextResponse.json({ outfit });
}

// POST /api/outfits/[slug]  — track download
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const outfit = await getOutfitBySlug(slug);
  if (!outfit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const db = createServiceRoleClient();
    await db.rpc("increment_outfit_download", { outfit_id: outfit.id });
  } catch {}

  return NextResponse.json({ ok: true });
}
