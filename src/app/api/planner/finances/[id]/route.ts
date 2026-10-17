import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerFinanceKind, isPlannerPaymentMethod } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { getPlannerFinanceEntry } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    const entry = await getPlannerFinanceEntry(id);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ entry });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if ("kind" in b && isPlannerFinanceKind(b.kind)) patch.kind = b.kind;
  if ("title" in b) {
    const title = String(b.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "What for is required" }, { status: 400 });
    patch.title = title;
  }
  if ("party" in b) {
    const party = String(b.party ?? "").trim();
    if (!party) return NextResponse.json({ error: "Who paid is required" }, { status: 400 });
    patch.party = party;
  }
  if ("amount" in b) {
    const amount = Number(b.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be more than zero" }, { status: 400 });
    }
    patch.amount = amount;
  }
  if ("payment_method" in b && isPlannerPaymentMethod(b.payment_method)) patch.payment_method = b.payment_method;
  if ("notes" in b) patch.notes = clean(b.notes);
  if ("paid_at" in b) {
    const paidAt = String(b.paid_at ?? "").trim();
    if (paidAt) patch.paid_at = paidAt;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const db = createServiceRoleClient();
  const { error } = await db.from("planner_finance_entries").update(patch).eq("id", id);
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/096_planner_finances.sql in the Supabase SQL editor."
          : error.message,
      },
      { status: 400 },
    );
  }
  revalidatePath("/planner/finances");
  revalidatePath(`/planner/finances/${id}`);
  return NextResponse.json({ entry: await getPlannerFinanceEntry(id) });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_finance_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/planner/finances");
  return NextResponse.json({ ok: true });
}
