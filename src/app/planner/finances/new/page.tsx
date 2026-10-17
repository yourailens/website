import FinanceForm from "@/components/planner/FinanceForm";
import { requirePlannerCorePage } from "@/lib/planner/auth";

export const dynamic = "force-dynamic";

export default async function NewFinancePage() {
  await requirePlannerCorePage();
  return <FinanceForm />;
}
