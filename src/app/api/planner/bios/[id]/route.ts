import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { plannerBioCategory, plannerBioLabel } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const TEXT_KEYS = [
  "full_name",
  "preferred_name",
  "pronouns",
  "company",
  "role_title",
  "department",
  "email",
  "phone",
  "whatsapp",
  "website",
  "linkedin",
  "instagram",
  "city",
  "country",
  "industry",
  "languages",
  "relationship",
  "source",
  "introduced_by",
  "bio",
  "notes",
  "birthday",
  "owner_id",
] as const;

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function revalidate(slug?: string | null) {
  revalidatePath("/planner/follow-ups/contacts");
  if (slug) {
    revalidatePath(`/planner/follow-ups/contacts/${slug}`);
    revalidatePath(`/planner/follow-ups/contacts/${slug}/edit`);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const key of TEXT_KEYS) {
    if (key in b) patch[key] = clean(b[key]);
  }
  if ("full_name" in patch && !patch.full_name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const db = createServiceRoleClient();
  if ("category" in b || "label" in b) {
    let category = plannerBioCategory(b.category);
    if (!("category" in b)) {
      const existing = await db.from("planner_bios").select("category").eq("id", id).maybeSingle();
      category = plannerBioCategory(existing.data?.category);
    }
    patch.category = category;
    patch.label = plannerBioLabel(category, b.label);
  }

  const { data, error } = await db.from("planner_bios").update(patch).eq("id", id).select("slug").single();
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/090_planner_bios.sql in the Supabase SQL editor first."
          : /category|label/i.test(error.message)
            ? "Run supabase/migrations/091_planner_bio_categories.sql in the Supabase SQL editor."
            : error.message,
      },
      { status: 400 },
    );
  }
  revalidate(data?.slug);
  return NextResponse.json({ slug: data?.slug });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const existing = await db.from("planner_bios").select("slug").eq("id", id).maybeSingle();
  const { error } = await db.from("planner_bios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate(existing.data?.slug);
  return NextResponse.json({ ok: true });
}
