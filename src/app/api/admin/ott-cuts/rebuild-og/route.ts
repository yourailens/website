import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllOttCuts } from "@/lib/ott-cuts/load";
import { persistOgJpegFromApiRoute } from "@/lib/seo/persist-og-from-route";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST /api/admin/ott-cuts/rebuild-og — bake share thumbs via OG routes (no sharp in this function). */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { missingOnly?: boolean };
  const missingOnly = body.missingOnly !== false;
  const origin = new URL(req.url).origin;
  const db = createServiceRoleClient();
  const cuts = await adminGetAllOttCuts();
  const targets = missingOnly ? cuts.filter((c) => !c.og_image_url) : cuts;

  const results: { id: string; slug: string; ok: boolean; og_image_url?: string; error?: string }[] = [];

  for (const cut of targets) {
    try {
      const og_image_url = await persistOgJpegFromApiRoute({
        origin,
        apiPath: `/api/og/ott-cut/${encodeURIComponent(cut.slug)}`,
        s3Prefix: "ott-cuts",
        slug: cut.slug,
      });
      const { error } = await db.from("ott_cuts").update({ og_image_url }).eq("id", cut.id);
      if (error) throw new Error(error.message);
      results.push({ id: cut.id, slug: cut.slug, ok: true, og_image_url });
    } catch (e) {
      results.push({
        id: cut.id,
        slug: cut.slug,
        ok: false,
        error: e instanceof Error ? e.message : "Bake failed",
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/ai-ads");
  revalidatePath("/ai-filmmaking");
  revalidatePath("/ai-verse");
  revalidatePath("/cut/[slug]", "page");
  revalidatePath("/admin");

  return NextResponse.json({
    baked: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
    cuts: await adminGetAllOttCuts(),
  });
}
