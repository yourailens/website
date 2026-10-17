import TaskCreate from "@/components/planner/TaskCreate";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const me = await requirePlannerPage();
  const members = await listPlannerMembers();
  return <TaskCreate me={me} members={members} />;
}
