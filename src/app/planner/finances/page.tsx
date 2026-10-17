import FinancesDesk from "@/components/planner/FinancesDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerFinanceEntries } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerFinancesPage() {
  await requirePlannerPage();
  const data = await listPlannerFinanceEntries();
  return (
    <FinancesDesk
      rows={data.rows}
      expenseTotal={data.expenseTotal}
      revenueTotal={data.revenueTotal}
      net={data.net}
      missing={data.missing}
    />
  );
}
