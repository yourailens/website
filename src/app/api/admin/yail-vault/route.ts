import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isYailVaultCategory, isYailVaultTagKind } from "@/data/yail-vault";
import { isYailVaultAiModelId } from "@/data/yail-vault-models";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  adminGetAllVaultEntries,
  clearOtherFeatured,
  listVaultTags,
  parseAvatarIds,
  setEntryAvatars,
  setEntryTags,
  uniqueVaultSlug,
} from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

function revalidateVault() {
  revalidatePath("/vault");
  revalidatePath("/vault/[slug]", "page");
  revalidatePath("/vault/avatars/[slug]", "page");
}

function parseTagInputs(b: Record<string, unknown>) {
  const tags: { kind: "genre" | "subject" | "label" | "avatar"; name: string }[] = [];
  const genre = String(b.genre ?? "").trim();
  const subject = String(b.subject ?? "").trim();
  const avatar = String(b.avatar ?? "").trim();
  if (genre) tags.push({ kind: "genre", name: genre });
  if (subject) tags.push({ kind: "subject", name: subject });
  if (avatar) tags.push({ kind: "avatar", name: avatar });

  const labels = Array.isArray(b.labels)
    ? b.labels
    : typeof b.labels === "string"
      ? b.labels.split(",")
      : [];
  for (const label of labels) {
    const name = String(label ?? "").trim();
    if (name) tags.push({ kind: "label", name });
  }
  return tags;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    const kind = req.nextUrl.searchParams.get("kind");
    if (kind === "tags") {
      const tagKind = req.nextUrl.searchParams.get("tagKind");
      const tags = await listVaultTags(isYailVaultTagKind(tagKind) ? tagKind : undefined);
      return NextResponse.json({ tags });
    }
    return NextResponse.json({ entries: await adminGetAllVaultEntries() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load vault" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const category = b.category;
  const media_type = b.media_type;
  const media_url = String(b.media_url ?? "").trim();

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!isYailVaultCategory(category)) {
    return NextResponse.json({ error: "Pick AI Filmmaking or AI Ads" }, { status: 400 });
  }
  if (media_type !== "image" && media_type !== "video") {
    return NextResponse.json({ error: "Upload a photo or a video" }, { status: 400 });
  }
  if (!media_url) return NextResponse.json({ error: "Media is required" }, { status: 400 });

  const db = createServiceRoleClient();
  const featured = b.featured === true;
  if (featured) await clearOtherFeatured(db);

  const { data: last } = await db
    .from("yail_vault_entries")
    .select("sort_order")
    .eq("category", category)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? 0) + 1;
  const slug = await uniqueVaultSlug(db, title);

  const aiModelRaw = typeof b.ai_model === "string" ? b.ai_model.trim() : "";
  const ai_model = aiModelRaw
    ? isYailVaultAiModelId(aiModelRaw)
      ? aiModelRaw
      : null
    : null;
  if (aiModelRaw && !ai_model) {
    return NextResponse.json({ error: "Pick a model from the AI Model list" }, { status: 400 });
  }

  const avatarIds = parseAvatarIds(b) ?? [];

  const aspect_width =
    typeof b.aspect_width === "number" && Number.isFinite(b.aspect_width) && b.aspect_width > 0
      ? Math.round(b.aspect_width)
      : null;
  const aspect_height =
    typeof b.aspect_height === "number" && Number.isFinite(b.aspect_height) && b.aspect_height > 0
      ? Math.round(b.aspect_height)
      : null;

  const poster_url = String(b.poster_url ?? "").trim() || null;

  const { data, error } = await db
    .from("yail_vault_entries")
    .insert({
      slug,
      category,
      title,
      caption: String(b.caption ?? "").trim() || null,
      notes: String(b.notes ?? "").trim() || null,
      media_type,
      media_url,
      poster_url,
      aspect_width,
      aspect_height,
      ai_model,
      featured,
      published: b.published !== false,
      sort_order,
    })
    .select("*")
    .single();

  if (error) {
    const missing = /does not exist|schema cache|ai_model|aspect_|og_image_url/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/074_yail_vault.sql, 077_yail_vault_ai_models.sql, 080_yail_vault_aspect.sql, and 082_vault_ott_og_images.sql in the Supabase SQL editor first."
          : error.message,
      },
      { status: 400 }
    );
  }

  await setEntryTags(db, data.id, parseTagInputs(b));
  try {
    await setEntryAvatars(db, data.id, avatarIds);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Avatar link failed";
    const missing = /does not exist|schema cache|yail_vault_entry_avatars/i.test(msg);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/079_yail_vault_entry_avatars.sql in the Supabase SQL editor first."
          : msg,
      },
      { status: 400 }
    );
  }
  revalidateVault();
  const entries = await adminGetAllVaultEntries();
  return NextResponse.json({ entry: entries.find((e) => e.id === data.id) ?? data, entries });
}
