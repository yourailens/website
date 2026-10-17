import FinanceForm from "@/components/planner/FinanceForm";
import { requirePlannerPage } from "@/lib/planner/auth";

export const dynamic = "force-dynamic";

export default async function NewFinancePage() {
  await requirePlannerPage();
  return <FinanceForm />;
}
