import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type GalleryTable = "gallery_images" | "gallery_films";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: { gallery?: string; orderedIds?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const gallery = body.gallery === "images" || body.gallery === "films" ? body.gallery : null;
  const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds.filter((x): x is string => typeof x === "string") : null;

  if (!gallery || !orderedIds?.length) {
    return NextResponse.json({ error: "gallery (images|films) and orderedIds[] required" }, { status: 400 });
  }

  const table: GalleryTable = gallery === "images" ? "gallery_images" : "gallery_films";

  let svc;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data: rows, error: fetchErr } = await svc.from(table).select("id");
  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const dbIds = new Set((rows ?? []).map((r: { id: string }) => r.id));
  if (orderedIds.length !== dbIds.size || orderedIds.some((id) => !dbIds.has(id)) || new Set(orderedIds).size !== orderedIds.length) {
    return NextResponse.json({ error: "orderedIds must list each gallery item exactly once" }, { status: 400 });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    const { error: updErr } = await svc.from(table).update({ sort_order: i }).eq("id", orderedIds[i]);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
