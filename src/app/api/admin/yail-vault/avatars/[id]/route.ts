import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllVaultAvatars, uniqueAvatarSlug } from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

function revalidateVault() {
  revalidatePath("/vault");
  revalidatePath("/vault/[slug]", "page");
  revalidatePath("/vault/avatars/[slug]", "page");
  revalidatePath("/admin/vault");
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const db = createServiceRoleClient();

  const patch: Record<string, unknown> = {};
  if (typeof b.name === "string") {
    const name = b.name.trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    patch.name = name;
    if (b.reslug === true) patch.slug = await uniqueAvatarSlug(db, name, id);
  }
  if (typeof b.tagline === "string") patch.tagline = b.tagline.trim() || null;
  if (typeof b.bio === "string") patch.bio = b.bio.trim() || null;
  if (typeof b.portrait_url === "string" && b.portrait_url.trim()) {
    patch.portrait_url = b.portrait_url.trim();
  }
  if (typeof b.accent === "string") patch.accent = b.accent.trim() || null;
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.round(b.sort_order);
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Clear stale share thumb when portrait/slug changes — bake on page view or rebuild-og.
  if (typeof patch.portrait_url === "string" || typeof patch.slug === "string") {
    patch.og_image_url = null;
  }

  const { error } = await db.from("yail_vault_avatars").update(patch).eq("id", id);
  if (error) {
    const missing = /does not exist|schema cache|og_image_url/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/078_yail_vault_avatar_directory.sql and 081_yail_vault_avatar_og.sql first."
          : error.message,
      },
      { status: 400 }
    );
  }

  revalidateVault();
  const avatars = await adminGetAllVaultAvatars();
  return NextResponse.json({ avatar: avatars.find((a) => a.id === id) ?? null, avatars });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const { error } = await createServiceRoleClient().from("yail_vault_avatars").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidateVault();
  return NextResponse.json({ ok: true, avatars: await adminGetAllVaultAvatars() });
}
