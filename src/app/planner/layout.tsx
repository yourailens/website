import PlannerShell from "@/components/planner/PlannerShell";
import { getPlannerSessionMember } from "@/lib/planner/auth";
import { listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
  const member = await getPlannerSessionMember();
  const people = member ? await listPlannerMembers({ activeOnly: true }) : [];
  return (
    <div className="planner-root">
      <PlannerShell member={member} people={people}>
        {children}
      </PlannerShell>
    </div>
  );
}
