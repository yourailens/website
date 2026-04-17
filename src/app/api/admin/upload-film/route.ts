import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";
import { CHARACTER_TAGS, type CharacterTag } from "@/data/gallery";
import { parsePublicHttpUrl } from "@/lib/validate-public-url";

export const runtime = "nodejs";

async function insertFilmRow(
  svc: ReturnType<typeof createServiceRoleClient>,
  publicUrl: string,
  title: string,
  category: string,
  orientation: string,
  peopleTags: CharacterTag[]
) {
  const { data: rows } = await svc
    .from("gallery_films")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (rows?.[0]?.sort_order ?? 0) + 1;

  const orientVal = orientation === "portrait" || orientation === "landscape" ? orientation : null;

  const { data: row, error: insErr } = await svc
    .from("gallery_films")
    .insert({
      title,
      category,
      orientation: orientVal,
      people_tags: peopleTags,
      public_url: publicUrl,
      sort_order,
    })
    .select("id")
    .single();

  return { row, insErr };
}

function normalizePeopleTags(value: unknown): CharacterTag[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
  const allowed = new Set<string>(CHARACTER_TAGS);
  return list.filter((v): v is CharacterTag => typeof v === "string" && allowed.has(v));
}

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

  let publicUrl: string;
  let title: string;
  let category: string;
  let orientation: string;
  let peopleTags: CharacterTag[];

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    title = String(form.get("title") ?? "").trim() || "Film";
    category = String(form.get("category") ?? "").trim();
    orientation = String(form.get("orientation") ?? "").trim();
    peopleTags = normalizePeopleTags(form.get("peopleTags"));
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const key = `gallery/videos/${Date.now()}-${safeObjectFilename(file.name)}`;
      const ct = file.type || "video/mp4";
      const { publicUrl: url } = await uploadObjectToS3(key, buf, ct);
      publicUrl = url;
    } catch (e) {
      const { message, hint, httpStatus } = formatAwsLikeError(e);
      return NextResponse.json({ error: message, hint }, { status: httpStatus });
    }
  } else {
    let body: { url?: string; title?: string; category?: string; orientation?: string; peopleTags?: string[] };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = parsePublicHttpUrl(String(body.url ?? ""));
    if (!parsed) {
      return NextResponse.json({ error: "Valid http(s) URL required" }, { status: 400 });
    }
    publicUrl = parsed;
    title = String(body.title ?? "").trim();
    category = String(body.category ?? "").trim();
    orientation = String(body.orientation ?? "").trim();
    peopleTags = normalizePeopleTags(body.peopleTags);
    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }
  }

  const { row, insErr } = await insertFilmRow(svc, publicUrl, title, category, orientation, peopleTags);
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: row?.id, publicUrl });
}
