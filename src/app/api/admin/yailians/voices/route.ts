import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllVoices, nextSortOrder } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/yailians");
  revalidatePath("/yailians/voices");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ voices: await adminGetAllVoices() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load voices" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const quote = String(b.quote ?? "").trim();
  if (!name || !quote) {
    return NextResponse.json({ error: "Name and quote are required" }, { status: 400 });
  }

  const db = createServiceRoleClient();
  const sort_order = await nextSortOrder("yailians_voices");
  const { data, error } = await db
    .from("yailians_voices")
    .insert({
      name,
      quote,
      role: String(b.role ?? "").trim() || null,
      portrait_url: String(b.portrait_url ?? "").trim() || null,
      video_url: String(b.video_url ?? "").trim() || null,
      featured_on_hub: b.featured_on_hub === true,
      published: b.published !== false,
      sort_order,
    })
    .select("*")
    .single();
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/085_yailians.sql in the Supabase SQL editor first."
          : error.message,
      },
      { status: 400 }
    );
  }
  revalidate();
  return NextResponse.json({ voice: data, voices: await adminGetAllVoices() });
}
