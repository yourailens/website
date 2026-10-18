import MilestonesDesk from "@/components/planner/MilestonesDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerMilestones } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function MilestonesPage() {
  await requirePlannerPage();
  const { rows, missing } = await listPlannerMilestones();
  return <MilestonesDesk rows={rows} missing={missing} />;
}
