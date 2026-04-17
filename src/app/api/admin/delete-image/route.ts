import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { deleteS3ObjectIfOurs } from "@/lib/s3/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let svc;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const body = (await request.json()) as { id?: string };
  const id = body.id?.trim();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: row, error: fetchErr } = await svc
    .from("gallery_images")
    .select("id,public_url")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: delDb } = await svc.from("gallery_images").delete().eq("id", id);
  if (delDb) {
    return NextResponse.json({ error: delDb.message }, { status: 500 });
  }

  try {
    await deleteS3ObjectIfOurs(row.public_url);
  } catch {
    /* row already removed from DB; log in production if needed */
  }

  return NextResponse.json({ ok: true });
}
