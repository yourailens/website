import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { extractFilmPosterJpegFromPath } from "@/lib/video/extract-poster";
import { downloadVideoToTempFile } from "@/lib/video/download-video-temp";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    .from("gallery_films")
    .select("id,public_url")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!row?.public_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let cleanup: (() => Promise<void>) | undefined;
  try {
    const dl = await downloadVideoToTempFile(row.public_url);
    cleanup = dl.cleanup;
    const extracted = await extractFilmPosterJpegFromPath(dl.path);
    if (!extracted.ok) {
      return NextResponse.json({ ok: false, posterError: extracted.reason }, { status: 422 });
    }

    const key = `gallery/posters/${row.id}.jpg`;
    const { publicUrl: posterUrl } = await uploadObjectToS3(key, extracted.jpeg, "image/jpeg");
    const { error: updErr } = await svc.from("gallery_films").update({ poster_url: posterUrl }).eq("id", row.id);
    if (updErr) {
      return NextResponse.json(
        { ok: false, error: `Saved poster to storage but DB update failed: ${updErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, posterUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg.slice(0, 600) }, { status: 502 });
  } finally {
    if (cleanup) await cleanup().catch(() => {});
  }
}
