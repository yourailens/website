import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllVaultAvatars } from "@/lib/yail-vault/load";
import { persistOgJpegFromApiRoute } from "@/lib/seo/persist-og-from-route";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/yail-vault/avatars/rebuild-og
 * Bake share thumbs via OG routes (no sharp in this function).
 */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { missingOnly?: boolean };
  const missingOnly = body.missingOnly !== false;
  const origin = new URL(req.url).origin;
  const db = createServiceRoleClient();
  const avatars = await adminGetAllVaultAvatars();
  const targets = missingOnly ? avatars.filter((a) => !a.og_image_url) : avatars;

  const results: { id: string; slug: string; ok: boolean; og_image_url?: string; error?: string }[] = [];

  for (const avatar of targets) {
    try {
      const og_image_url = await persistOgJpegFromApiRoute({
        origin,
        apiPath: `/api/og/vault-avatar/${encodeURIComponent(avatar.slug)}`,
        s3Prefix: "yail-vault",
        slug: avatar.slug,
      });
      const { error } = await db.from("yail_vault_avatars").update({ og_image_url }).eq("id", avatar.id);
      if (error) throw new Error(error.message);
      results.push({ id: avatar.id, slug: avatar.slug, ok: true, og_image_url });
    } catch (e) {
      results.push({
        id: avatar.id,
        slug: avatar.slug,
        ok: false,
        error: e instanceof Error ? e.message : "Bake failed",
      });
    }
  }

  revalidatePath("/vault");
  revalidatePath("/vault/avatars/[slug]", "page");
  revalidatePath("/admin/vault");

  return NextResponse.json({
    baked: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
    avatars: await adminGetAllVaultAvatars(),
  });
}
