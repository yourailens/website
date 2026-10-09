import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isYailVaultCategory } from "@/data/yail-vault";
import { isYailVaultAiModelId } from "@/data/yail-vault-models";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  adminGetAllVaultEntries,
  clearOtherFeatured,
  parseAvatarIds,
  setEntryAvatars,
  setEntryTags,
  uniqueVaultSlug,
} from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

function revalidateVault() {
  revalidatePath("/vault");
  revalidatePath("/vault/[slug]", "page");
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

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const db = createServiceRoleClient();

  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") {
    const title = b.title.trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    patch.title = title;
    if (b.reslug === true) patch.slug = await uniqueVaultSlug(db, title, id);
  }
  if (typeof b.caption === "string") patch.caption = b.caption.trim() || null;
  if (typeof b.notes === "string") patch.notes = b.notes.trim() || null;
  if (isYailVaultCategory(b.category)) patch.category = b.category;
  if (b.media_type === "image" || b.media_type === "video") patch.media_type = b.media_type;
  if (typeof b.media_url === "string" && b.media_url.trim()) patch.media_url = b.media_url.trim();
  if (typeof b.poster_url === "string") patch.poster_url = b.poster_url.trim() || null;
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.round(b.sort_order);
  }
  if (typeof b.featured === "boolean") {
    patch.featured = b.featured;
    if (b.featured) await clearOtherFeatured(db, id);
  }
  if ("ai_model" in b) {
    const raw = typeof b.ai_model === "string" ? b.ai_model.trim() : "";
    if (!raw) patch.ai_model = null;
    else if (isYailVaultAiModelId(raw)) patch.ai_model = raw;
    else return NextResponse.json({ error: "Pick a model from the AI Model list" }, { status: 400 });
  }
  if (Object.keys(patch).length) {
    const { error } = await db.from("yail_vault_entries").update(patch).eq("id", id);
    if (error) {
      const missing = /ai_model|schema cache/i.test(error.message);
      return NextResponse.json(
        {
          error: missing
            ? "Run supabase/migrations/077_yail_vault_ai_models.sql in the Supabase SQL editor first."
            : error.message,
        },
        { status: 400 }
      );
    }
  }

  if ("genre" in b || "subject" in b || "labels" in b || "avatar" in b) {
    await setEntryTags(db, id, parseTagInputs(b));
  }

  const avatarIds = parseAvatarIds(b);
  if (avatarIds !== undefined) {
    try {
      await setEntryAvatars(db, id, avatarIds);
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
  }

  revalidateVault();
  const entries = await adminGetAllVaultEntries();
  return NextResponse.json({ entry: entries.find((e) => e.id === id) ?? null, entries });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const { error } = await createServiceRoleClient().from("yail_vault_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidateVault();
  return NextResponse.json({ ok: true, entries: await adminGetAllVaultEntries() });
}
