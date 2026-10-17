import { notFound } from "next/navigation";
import FinanceForm from "@/components/planner/FinanceForm";
import { requirePlannerCorePage } from "@/lib/planner/auth";
import { getPlannerFinanceEntry } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function EditFinancePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlannerCorePage();
  const { id } = await params;
  const entry = await getPlannerFinanceEntry(id);
  if (!entry) notFound();
  return <FinanceForm initial={entry} />;
}
