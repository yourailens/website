import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isYailVaultCategory } from "@/data/yail-vault";
import { isYailVaultAiModelId } from "@/data/yail-vault-models";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  adminGetAllVaultEntries,
  clearOtherCategoryHero,
  clearOtherFeatured,
  clearOtherGenreHero,
  parseAvatarIds,
  setEntryAvatars,
  setEntryTags,
  uniqueVaultSlug,
} from "@/lib/yail-vault/load";
import { tagsOfKind } from "@/data/yail-vault";

export const dynamic = "force-dynamic";

function revalidateVault() {
  revalidatePath("/vault");
  revalidatePath("/vault/[slug]", "page");
  revalidatePath("/vault/avatars/[slug]", "page");
  revalidatePath("/vault/filmmaking");
  revalidatePath("/vault/filmmaking/[genre]", "page");
}

function slugifyGenre(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
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
  if ("aspect_width" in b || "aspect_height" in b) {
    const aw =
      typeof b.aspect_width === "number" && Number.isFinite(b.aspect_width) && b.aspect_width > 0
        ? Math.round(b.aspect_width)
        : null;
    const ah =
      typeof b.aspect_height === "number" && Number.isFinite(b.aspect_height) && b.aspect_height > 0
        ? Math.round(b.aspect_height)
        : null;
    patch.aspect_width = aw && ah ? aw : null;
    patch.aspect_height = aw && ah ? ah : null;
  }
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.round(b.sort_order);
  }
  if (typeof b.featured === "boolean") {
    patch.featured = b.featured;
    if (b.featured) await clearOtherFeatured(db, id);
  }
  if (typeof b.category_hero === "boolean") {
    patch.category_hero = b.category_hero;
    if (b.category_hero) {
      const category =
        isYailVaultCategory(patch.category)
          ? patch.category
          : isYailVaultCategory(b.category)
            ? b.category
            : null;
      if (category) await clearOtherCategoryHero(db, category, id);
      else {
        const { data: current } = await db
          .from("yail_vault_entries")
          .select("category")
          .eq("id", id)
          .maybeSingle();
        if (isYailVaultCategory(current?.category)) {
          await clearOtherCategoryHero(db, current.category, id);
        }
      }
    }
  }
  if (typeof b.genre_hero === "boolean") {
    patch.genre_hero = b.genre_hero;
    if (b.genre_hero) {
      const genreFromBody = String(b.genre ?? "").trim();
      let genreSlug = genreFromBody ? slugifyGenre(genreFromBody) : "";
      if (!genreSlug) {
        const entries = await adminGetAllVaultEntries();
        const current = entries.find((e) => e.id === id);
        const tag = current ? tagsOfKind(current, "genre")[0] : null;
        genreSlug = tag?.slug || (tag?.name ? slugifyGenre(tag.name) : "");
      }
      if (!genreSlug) {
        return NextResponse.json(
          { error: "Pick a Genre before setting Genre page hero" },
          { status: 400 }
        );
      }
      await clearOtherGenreHero(db, genreSlug, id);
    }
  }
  if ("ai_model" in b) {
    const raw = typeof b.ai_model === "string" ? b.ai_model.trim() : "";
    if (!raw) patch.ai_model = null;
    else if (isYailVaultAiModelId(raw)) patch.ai_model = raw;
    else return NextResponse.json({ error: "Pick a model from the AI Model list" }, { status: 400 });
  }
  if ("media_url" in patch || "poster_url" in patch || "media_type" in patch || "slug" in patch) {
    patch.og_image_url = null;
  }

  if (Object.keys(patch).length) {
    const { error } = await db.from("yail_vault_entries").update(patch).eq("id", id);
    if (error) {
      const missing = /ai_model|aspect_|og_image_url|category_hero|genre_hero|schema cache/i.test(
        error.message
      );
      return NextResponse.json(
        {
          error: missing
            ? "Run supabase/migrations/077–083 (incl. 083_yail_vault_page_heroes.sql) in the Supabase SQL editor first."
            : error.message,
        },
        { status: 400 }
      );
    }
  }

  if ("genre" in b || "subject" in b || "labels" in b || "avatar" in b) {
    await setEntryTags(db, id, parseTagInputs(b));
  }

  // After tags settle, keep a single genre-page hero per genre slug.
  if (b.genre_hero === true || typeof b.genre === "string") {
    const refreshed = (await adminGetAllVaultEntries()).find((e) => e.id === id);
    if (refreshed?.genre_hero) {
      const tag = tagsOfKind(refreshed, "genre")[0];
      const slug = tag?.slug || (tag?.name ? slugifyGenre(tag.name) : "");
      if (slug) await clearOtherGenreHero(db, slug, id);
    }
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
