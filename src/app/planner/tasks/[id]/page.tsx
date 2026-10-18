import { notFound } from "next/navigation";
import TaskEdit from "@/components/planner/TaskEdit";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerMembers, listPlannerTaskEntries, listPlannerTasks } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const me = await requirePlannerPage();
  const { id } = await params;
  const sp = await searchParams;
  const [members, tasks, entries] = await Promise.all([listPlannerMembers(), listPlannerTasks(), listPlannerTaskEntries(id)]);
  const task = tasks.find((t) => t.id === id);
  if (!task) notFound();
  return <TaskEdit me={me} members={members} task={task} entries={entries} startEditing={sp.edit === "1"} />;
}
