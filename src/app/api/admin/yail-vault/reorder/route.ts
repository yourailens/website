import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllVaultEntries } from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

/** Body: { orderedIds: string[] } — highest sort_order first. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as { orderedIds?: unknown };
  const orderedIds = Array.isArray(b.orderedIds)
    ? b.orderedIds.map((id) => String(id)).filter(Boolean)
    : [];
  if (!orderedIds.length) {
    return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
  }

  const db = createServiceRoleClient();
  const total = orderedIds.length;
  for (let i = 0; i < orderedIds.length; i += 1) {
    const { error } = await db
      .from("yail_vault_entries")
      .update({ sort_order: total - i })
      .eq("id", orderedIds[i]);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/vault");
  return NextResponse.json({ entries: await adminGetAllVaultEntries() });
}
