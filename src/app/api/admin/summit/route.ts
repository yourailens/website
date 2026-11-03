import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { SUMMIT_PATH } from "@/data/summit-posts";
import { getSummitFilm, saveSummitFilm } from "@/lib/summit/load";

export const dynamic = "force-dynamic";

function revalidateSummit() {
  revalidatePath(SUMMIT_PATH);
  revalidatePath("/");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ film: await getSummitFilm() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load the film" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const film = await saveSummitFilm({
      video_url:
        typeof b.video_url === "string" ? b.video_url : b.video_url === null ? null : undefined,
      poster_url:
        typeof b.poster_url === "string" ? b.poster_url : b.poster_url === null ? null : undefined,
    });
    revalidateSummit();
    return NextResponse.json({ film });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save" },
      { status: 400 }
    );
  }
}
