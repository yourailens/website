import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { getYailiansSite, upsertYailiansSite } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

function revalidateYailians() {
  revalidatePath("/yailians");
  revalidatePath("/yailians/voices");
  revalidatePath("/yailians/screenings");
  revalidatePath("/yailians/world");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ site: await getYailiansSite() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load YAILIANS site" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const site = await upsertYailiansSite({
      title: typeof b.title === "string" ? b.title : undefined,
      tagline: typeof b.tagline === "string" ? b.tagline : b.tagline === null ? null : undefined,
      synopsis: typeof b.synopsis === "string" ? b.synopsis : b.synopsis === null ? null : undefined,
      trailer_url:
        typeof b.trailer_url === "string" ? b.trailer_url : b.trailer_url === null ? null : undefined,
      trailer_poster:
        typeof b.trailer_poster === "string"
          ? b.trailer_poster
          : b.trailer_poster === null
            ? null
            : undefined,
      hero_image_url:
        typeof b.hero_image_url === "string"
          ? b.hero_image_url
          : b.hero_image_url === null
            ? null
            : undefined,
      runtime_label:
        typeof b.runtime_label === "string"
          ? b.runtime_label
          : b.runtime_label === null
            ? null
            : undefined,
    });
    revalidateYailians();
    return NextResponse.json({ site });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save";
    const missing = /does not exist|schema cache|yailians|hero_image/i.test(msg);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/085_yailians.sql and 086_yailians_hero.sql in the Supabase SQL editor first."
          : msg,
      },
      { status: 400 }
    );
  }
}
