import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isYailiansScreeningStatus } from "@/data/yailians";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllScreenings, nextSortOrder } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/yailians");
  revalidatePath("/yailians/screenings");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ screenings: await adminGetAllScreenings() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load screenings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const status = isYailiansScreeningStatus(b.status) ? b.status : "upcoming";

  const db = createServiceRoleClient();
  const sort_order = await nextSortOrder("yailians_screenings");
  const { data, error } = await db
    .from("yailians_screenings")
    .insert({
      title,
      status,
      venue: String(b.venue ?? "").trim() || null,
      city: String(b.city ?? "").trim() || null,
      starts_at: String(b.starts_at ?? "").trim() || null,
      ends_at: String(b.ends_at ?? "").trim() || null,
      notes: String(b.notes ?? "").trim() || null,
      cover_url: String(b.cover_url ?? "").trim() || null,
      ticket_url: String(b.ticket_url ?? "").trim() || null,
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
  return NextResponse.json({ screening: data, screenings: await adminGetAllScreenings() });
}
