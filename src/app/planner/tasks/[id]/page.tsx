import { notFound } from "next/navigation";
import TaskEdit from "@/components/planner/TaskEdit";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerMembers, listPlannerTasks } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePlannerPage();
  const { id } = await params;
  const [members, tasks] = await Promise.all([listPlannerMembers(), listPlannerTasks()]);
  const task = tasks.find((t) => t.id === id);
  if (!task) notFound();
  return <TaskEdit me={me} members={members} task={task} />;
}
