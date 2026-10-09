import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllVaultEntries } from "@/lib/yail-vault/load";
import { bakeOgJpegToS3, mediaSourceForOg } from "@/lib/seo/bake-og-image";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST /api/admin/yail-vault/rebuild-og — bake share thumbs for vault cuts. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { missingOnly?: boolean };
  const missingOnly = body.missingOnly !== false;
  const db = createServiceRoleClient();
  const entries = await adminGetAllVaultEntries();
  const targets = missingOnly ? entries.filter((e) => !e.og_image_url) : entries;

  const results: { id: string; slug: string; ok: boolean; og_image_url?: string; error?: string }[] = [];

  for (const entry of targets) {
    try {
      const source = mediaSourceForOg({
        poster_url: entry.poster_url,
        media_url: entry.media_url,
        media_type: entry.media_type,
      });
      if (!source) throw new Error("No poster/image source");
      const og_image_url = await bakeOgJpegToS3("yail-vault", entry.slug, source);
      const { error } = await db.from("yail_vault_entries").update({ og_image_url }).eq("id", entry.id);
      if (error) throw new Error(error.message);
      results.push({ id: entry.id, slug: entry.slug, ok: true, og_image_url });
    } catch (e) {
      results.push({
        id: entry.id,
        slug: entry.slug,
        ok: false,
        error: e instanceof Error ? e.message : "Bake failed",
      });
    }
  }

  revalidatePath("/vault");
  revalidatePath("/vault/[slug]", "page");
  revalidatePath("/admin/vault");

  return NextResponse.json({
    baked: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
    entries: await adminGetAllVaultEntries(),
  });
}
