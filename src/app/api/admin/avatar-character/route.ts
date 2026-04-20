import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isAvatarSlug } from "@/lib/avatars/config";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let svc;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  let body: { slug?: string; headline?: string; story?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!isAvatarSlug(slug)) {
    return NextResponse.json({ error: "Invalid character slug" }, { status: 400 });
  }

  const headline = body.headline !== undefined ? String(body.headline) : undefined;
  const story = body.story !== undefined ? String(body.story) : undefined;
  if (headline === undefined && story === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const patch: Record<string, string> = { updated_at: new Date().toISOString() };
  if (headline !== undefined) patch.headline = headline;
  if (story !== undefined) patch.story = story;

  const { error } = await svc.from("avatar_characters").update(patch).eq("slug", slug);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
