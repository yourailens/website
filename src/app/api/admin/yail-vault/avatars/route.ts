import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  adminGetAllVaultAvatars,
  uniqueAvatarSlug,
} from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

function revalidateVault() {
  revalidatePath("/vault");
  revalidatePath("/vault/[slug]", "page");
  revalidatePath("/vault/avatars/[slug]", "page");
  revalidatePath("/admin/vault");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ avatars: await adminGetAllVaultAvatars() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load avatars" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const portrait_url = String(b.portrait_url ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!portrait_url) return NextResponse.json({ error: "Upload a portrait" }, { status: 400 });

  const db = createServiceRoleClient();
  const slug = await uniqueAvatarSlug(db, name);

  const { data: last } = await db
    .from("yail_vault_avatars")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? 0) + 1;

  // Share thumbs bake on avatar page view / rebuild-og (keeps this function under Vercel size limits).
  const { data, error } = await db
    .from("yail_vault_avatars")
    .insert({
      slug,
      name,
      tagline: String(b.tagline ?? "").trim() || null,
      bio: String(b.bio ?? "").trim() || null,
      portrait_url,
      accent: String(b.accent ?? "").trim() || null,
      published: b.published !== false,
      sort_order,
    })
    .select("*")
    .single();

  if (error) {
    const missing = /does not exist|schema cache|og_image_url/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/078_yail_vault_avatar_directory.sql and 081_yail_vault_avatar_og.sql in the Supabase SQL editor first."
          : error.message,
      },
      { status: 400 }
    );
  }

  revalidateVault();
  const avatars = await adminGetAllVaultAvatars();
  return NextResponse.json({ avatar: data, avatars });
}
