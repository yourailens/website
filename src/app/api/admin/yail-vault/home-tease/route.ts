import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { isYailVaultCategory } from "@/data/yail-vault";
import { adminGetAllVaultEntries } from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

const MAX_PER_ROW = 6;

function parseIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const id = String(item ?? "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_PER_ROW) break;
  }
  return out;
}

/**
 * Body: { filmmakingIds: string[], adsIds: string[] }
 * Replaces the homepage vault tease selection for both rows.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json().catch(() => ({}))) as {
    filmmakingIds?: unknown;
    adsIds?: unknown;
  };
  const filmmakingIds = parseIds(b.filmmakingIds);
  const adsIds = parseIds(b.adsIds);

  const db = createServiceRoleClient();
  const all = await adminGetAllVaultEntries();
  const byId = new Map(all.map((e) => [e.id, e]));

  for (const id of filmmakingIds) {
    const entry = byId.get(id);
    if (!entry || entry.category !== "filmmaking") {
      return NextResponse.json(
        { error: "Filmmaking row has an invalid cut (must be AI Filmmaking)." },
        { status: 400 }
      );
    }
  }
  for (const id of adsIds) {
    const entry = byId.get(id);
    if (!entry || entry.category !== "ads") {
      return NextResponse.json(
        { error: "Ads row has an invalid cut (must be AI Ads)." },
        { status: 400 }
      );
    }
  }

  const { error: clearErr } = await db
    .from("yail_vault_entries")
    .update({ home_tease: false, home_tease_order: 0 })
    .eq("home_tease", true);
  if (clearErr) {
    const missing = /home_tease|schema cache|does not exist/i.test(clearErr.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/084_yail_vault_home_tease.sql in the Supabase SQL editor first."
          : clearErr.message,
      },
      { status: 400 }
    );
  }

  const applyRow = async (ids: string[], category: "filmmaking" | "ads") => {
    for (let i = 0; i < ids.length; i += 1) {
      const { error } = await db
        .from("yail_vault_entries")
        .update({ home_tease: true, home_tease_order: i })
        .eq("id", ids[i])
        .eq("category", category);
      if (error) throw new Error(error.message);
    }
  };

  try {
    await applyRow(filmmakingIds, "filmmaking");
    await applyRow(adsIds, "ads");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save homepage tease." },
      { status: 400 }
    );
  }

  revalidatePath("/");
  revalidatePath("/vault");

  return NextResponse.json({
    entries: await adminGetAllVaultEntries(),
    filmmakingIds,
    adsIds,
  });
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const entries = await adminGetAllVaultEntries();
  const tease = entries
    .filter((e) => e.home_tease)
    .sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.home_tease_order - b.home_tease_order;
    });

  return NextResponse.json({
    filmmakingIds: tease.filter((e) => e.category === "filmmaking").map((e) => e.id),
    adsIds: tease.filter((e) => e.category === "ads").map((e) => e.id),
    maxPerRow: MAX_PER_ROW,
    categories: ["filmmaking", "ads"].filter(isYailVaultCategory),
  });
}
