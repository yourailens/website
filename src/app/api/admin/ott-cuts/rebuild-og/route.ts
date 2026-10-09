import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { ottCutYoutubeId } from "@/data/ott-cuts";
import { adminGetAllOttCuts } from "@/lib/ott-cuts/load";
import { bakeOgJpegToS3, mediaSourceForOg } from "@/lib/seo/bake-og-image";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST /api/admin/ott-cuts/rebuild-og — bake share thumbs for ads/films/community cuts. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { missingOnly?: boolean };
  const missingOnly = body.missingOnly !== false;
  const db = createServiceRoleClient();
  const cuts = await adminGetAllOttCuts();
  const targets = missingOnly ? cuts.filter((c) => !c.og_image_url) : cuts;

  const results: { id: string; slug: string; ok: boolean; og_image_url?: string; error?: string }[] = [];

  for (const cut of targets) {
    try {
      const yt = ottCutYoutubeId(cut.media_url);
      const source = mediaSourceForOg({
        poster_url: cut.poster_url,
        media_url: cut.media_url,
        media_type: cut.media_type,
        youtubeThumb: yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null,
      });
      if (!source) throw new Error("No poster/image source");
      const og_image_url = await bakeOgJpegToS3("ott-cuts", cut.slug, source);
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
