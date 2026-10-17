import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { plannerBioCategory, plannerBioLabel, slugifyPlannerName } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { ensureUniqueBioSlug, listPlannerBios } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TEXT_KEYS = [
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
] as const;

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function revalidate(slug?: string) {
  revalidatePath("/planner/follow-ups/contacts");
  if (slug) {
    revalidatePath(`/planner/follow-ups/contacts/${slug}`);
    revalidatePath(`/planner/follow-ups/contacts/${slug}/edit`);
  }
}

export async function GET() {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await listPlannerBios());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load contacts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const fullName = String(b.full_name ?? "").trim();
  if (!fullName) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const category = plannerBioCategory(b.category);
  const row: Record<string, unknown> = {
    full_name: fullName,
    slug: await ensureUniqueBioSlug(slugifyPlannerName(fullName)),
    birthday: clean(b.birthday),
    category,
    label: plannerBioLabel(category, b.label),
    owner_id: clean(b.owner_id) || auth.member.id,
    created_by: auth.member.id,
  };
  for (const key of TEXT_KEYS) row[key] = clean(b[key]);

  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_bios").insert(row).select("id, slug").single();
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
  return NextResponse.json({ id: data?.id, slug: data?.slug });
}
