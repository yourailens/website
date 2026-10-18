import MilestoneForm from "@/components/planner/MilestoneForm";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerMembers, listPlannerMilestones } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewMilestonePage() {
  await requirePlannerPage();
  const [members, board] = await Promise.all([listPlannerMembers(), listPlannerMilestones()]);
  return (
    <MilestoneForm
      members={members}
      others={board.rows.map((row) => ({ id: row.id, title: row.title, status: row.status }))}
    />
  );
}
