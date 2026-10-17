import Link from "next/link";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerMembers, listPlannerTasks } from "@/lib/planner/load";
import { DashHero, Stat } from "@/components/planner/planner-look";
import { P_PAGE } from "@/components/planner/planner-ui";

export const dynamic = "force-dynamic";

export default async function PlannerPeoplePage() {
  await requirePlannerPage();
  const [members, tasks] = await Promise.all([listPlannerMembers(), listPlannerTasks()]);
  const openBy = new Map<string, number>();
  for (const t of tasks) {
    if (t.status === "done") continue;
    openBy.set(t.assignee_id, (openBy.get(t.assignee_id) ?? 0) + 1);
  }
  const open = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className={P_PAGE}>
      <DashHero eyebrow="Cast" title="The people" text="Every page is a desk. Tasks, meetings, notes, and posts live with the person.">
        <Stat label="People" value={members.length} />
        <Stat label="Open tasks" value={open} tone="text-[#fbbf24]" />
      </DashHero>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <li key={m.id}>
            <Link href={`/planner/people/${m.slug}`} className="flex aspect-square flex-col rounded-[28px] border border-white/25 bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl">
              <p className="text-[48px] font-bold leading-none">{m.display_name.slice(0, 1).toUpperCase()}</p>
              <p className="mt-auto text-[22px] font-bold leading-tight">{m.display_name}</p>
              <p className="mt-1 text-[14px] text-white/70">{m.role_title || "Team"}</p>
              <p className="mt-2 text-[13px] text-white/55">{openBy.get(m.id) ?? 0} open</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
