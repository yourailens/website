import FollowUpsDesk from "@/components/planner/FollowUpsDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerContacts } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerFollowUpsPage() {
  const me = await requirePlannerPage();
  const contacts = await listPlannerContacts();
  return <FollowUpsDesk me={me} initialContacts={contacts} />;
}
