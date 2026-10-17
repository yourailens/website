import TasksDesk from "@/components/planner/TasksDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerTasks } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerTasksPage() {
  const me = await requirePlannerPage();
  const tasks = await listPlannerTasks();
  return <TasksDesk me={me} initialTasks={tasks} />;
}
