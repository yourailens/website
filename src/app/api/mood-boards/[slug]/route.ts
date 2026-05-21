import { NextRequest, NextResponse } from "next/server";
import { getMoodBoardBySlug } from "@/lib/mood_boards/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await getMoodBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  createServiceRoleClient().rpc("increment_mood_board_view", { board_id: board.id }).then(() => {});
  return NextResponse.json({ mood_board: board });
}
export async function POST(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await getMoodBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await createServiceRoleClient().rpc("increment_mood_board_download", { board_id: board.id });
  return NextResponse.json({ ok: true });
}
