import { notFound } from "next/navigation";
import MilestoneThread from "@/components/planner/MilestoneThread";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerMilestone, listPlannerMembers, listPlannerMilestones, listPlannerTasks } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function MilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePlannerPage();
  const { id } = await params;
  const [found, members, board, tasks] = await Promise.all([
    getPlannerMilestone(id),
    listPlannerMembers(),
    listPlannerMilestones(),
    listPlannerTasks(),
  ]);
  if (!found) notFound();
  return (
    <MilestoneThread
      milestone={found.milestone}
      entries={found.entries}
      tasks={found.tasks}
      looseTasks={tasks.filter((task) => !task.milestone_id)}
      others={board.rows.filter((row) => row.id !== id).map((row) => ({ id: row.id, title: row.title, status: row.status }))}
      members={members}
      meId={me.id}
    />
  );
}
