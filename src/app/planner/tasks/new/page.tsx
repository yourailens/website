import TaskCreate from "@/components/planner/TaskCreate";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ milestone?: string }> }) {
  const me = await requirePlannerPage();
  const sp = await searchParams;
  const members = await listPlannerMembers();
  const milestoneId = sp.milestone?.trim() || null;
  return <TaskCreate me={me} members={members} milestoneId={milestoneId} />;
}
