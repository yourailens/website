import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { deleteS3ObjectIfOurs } from "@/lib/s3/client";

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

  const { data: row, error: selErr } = await svc
    .from("instagram_links")
    .select("thumbnail_url")
    .eq("id", id)
    .single();
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

  const { error } = await svc.from("instagram_links").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await deleteS3ObjectIfOurs(String(row?.thumbnail_url ?? ""));
  return NextResponse.json({ ok: true });
}
