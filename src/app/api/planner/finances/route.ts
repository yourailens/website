import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerFinanceKind, isPlannerPaymentMethod } from "@/data/planner";
import { requirePlannerCore } from "@/lib/planner/auth";
import { listPlannerFinanceEntries } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET() {
  const auth = await requirePlannerCore();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await listPlannerFinanceEntries());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load finances" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlannerCore();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  if (!isPlannerFinanceKind(b.kind)) return NextResponse.json({ error: "Kind required" }, { status: 400 });
  const title = String(b.title ?? "").trim();
  const party = String(b.party ?? "").trim();
  const amount = Number(b.amount);
  if (!title) return NextResponse.json({ error: "What for is required" }, { status: 400 });
  if (!party) return NextResponse.json({ error: "Who paid is required" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Amount must be more than zero" }, { status: 400 });
  const payment_method = isPlannerPaymentMethod(b.payment_method) ? b.payment_method : null;
  if (!payment_method) return NextResponse.json({ error: "Payment method required" }, { status: 400 });

  const paidAt = String(b.paid_at ?? "").trim();
  const row: Record<string, unknown> = {
    kind: b.kind,
    title,
    party,
    amount,
    currency: "INR",
    payment_method,
    notes: clean(b.notes),
    created_by: auth.member.id,
  };
  if (paidAt) row.paid_at = paidAt;

  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_finance_entries").insert(row).select("id").single();
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
  return NextResponse.json({ id: data?.id });
}
