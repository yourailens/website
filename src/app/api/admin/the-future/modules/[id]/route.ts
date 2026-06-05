import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  adminGetFutureModule,
  adminGetFutureModuleWithField,
  adminReplaceModuleFrames,
  type FutureFrameInput,
} from "@/lib/the-future/load";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "slug",
  "title",
  "tagline",
  "intro",
  "cover_image_url",
  "cover_video_url",
  "cover_media_type",
  "cover_aspect",
  "sort_order",
  "published",
];

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const mod = await adminGetFutureModuleWithField(id);
  if (!mod) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ module: mod });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)));

  const db = createServiceRoleClient();
  const { error } = await db.from("future_modules").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(body.frames)) {
    try {
      await adminReplaceModuleFrames(id, body.frames as FutureFrameInput[]);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Frame save failed" }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("future_modules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
