import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { parsePublicHttpUrl } from "@/lib/validate-public-url";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";

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

  const contentType = request.headers.get("content-type") ?? "";
  let title = "";
  let url: string | null = null;
  let thumbnailUrl: string | null = null;
  let tag: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    title = String(form.get("title") ?? "").trim();
    url = parsePublicHttpUrl(String(form.get("url") ?? ""));
    const file = form.get("file");
    const thumbnailUrlRaw = String(form.get("thumbnailUrl") ?? "").trim();
    thumbnailUrl = thumbnailUrlRaw ? parsePublicHttpUrl(thumbnailUrlRaw) : null;
    const tagRaw = String(form.get("tag") ?? "").trim();
    tag = tagRaw || null;
    if (thumbnailUrlRaw && !thumbnailUrl) {
      return NextResponse.json({ error: "Thumbnail URL must be a valid http(s) URL" }, { status: 400 });
    }
    if (file instanceof File && file.size > 0) {
      try {
        const buf = Buffer.from(await file.arrayBuffer());
        const key = `social/youtube/${Date.now()}-${safeObjectFilename(file.name)}`;
        const ct = file.type || "application/octet-stream";
        const uploaded = await uploadObjectToS3(key, buf, ct);
        thumbnailUrl = uploaded.publicUrl;
      } catch (e) {
        const { message, hint, httpStatus } = formatAwsLikeError(e);
        return NextResponse.json({ error: message, hint }, { status: httpStatus });
      }
    }
  } else {
    let body: { title?: string; url?: string; thumbnailUrl?: string; tag?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    title = String(body.title ?? "").trim();
    url = parsePublicHttpUrl(String(body.url ?? ""));
    const thumbnailUrlRaw = String(body.thumbnailUrl ?? "").trim();
    thumbnailUrl = thumbnailUrlRaw ? parsePublicHttpUrl(thumbnailUrlRaw) : null;
    const tagRaw = String(body.tag ?? "").trim();
    tag = tagRaw || null;
    if (thumbnailUrlRaw && !thumbnailUrl) {
      return NextResponse.json({ error: "Thumbnail URL must be a valid http(s) URL" }, { status: 400 });
    }
  }

  if (!title || !url) {
    return NextResponse.json({ error: "Title and valid URL are required" }, { status: 400 });
  }

  const { data: rows } = await svc
    .from("youtube_links")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (rows?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await svc
    .from("youtube_links")
    .insert({ title, url, thumbnail_url: thumbnailUrl, tag, sort_order })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: data?.id });
}
