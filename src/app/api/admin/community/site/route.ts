import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetCommunitySite } from "@/lib/community/load";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/ai-verse");
}

const MISSING = "Run supabase/migrations/107_community.sql in the Supabase SQL editor first.";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ site: await adminGetCommunitySite() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load community page" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const count = Number(b.member_count);
  const db = createServiceRoleClient();
  const { error } = await db.from("community_site").upsert({
    id: 1,
    eyebrow: String(b.eyebrow ?? "YAIL").trim() || "YAIL",
    title,
    lede: String(b.lede ?? "").trim() || null,
    member_count: Number.isFinite(count) ? Math.max(0, Math.round(count)) : 180,
    member_label: String(b.member_label ?? "members").trim() || "members",
    cta_label: String(b.cta_label ?? "Show your interest").trim() || "Show your interest",
  });
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json({ error: missing ? MISSING : error.message }, { status: 400 });
  }
  revalidate();
  return NextResponse.json({ site: await adminGetCommunitySite() });
}
