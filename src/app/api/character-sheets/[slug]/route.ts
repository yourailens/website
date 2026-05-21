import { NextRequest, NextResponse } from "next/server";
import { getCharacterSheetBySlug } from "@/lib/character_sheets/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sheet = await getCharacterSheetBySlug(slug);
  if (!sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count (fire and forget)
  const sb = createServiceRoleClient();
  sb.rpc("increment_character_sheet_view", { sheet_id: sheet.id }).then(() => {});

  return NextResponse.json({ character_sheet: sheet });
}

// POST = track download
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sheet = await getCharacterSheetBySlug(slug);
  if (!sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sb = createServiceRoleClient();
  await sb.rpc("increment_character_sheet_download", { sheet_id: sheet.id });
  return NextResponse.json({ ok: true });
}
