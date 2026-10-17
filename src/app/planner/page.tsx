import { redirect } from "next/navigation";
import { requirePlannerPage } from "@/lib/planner/auth";

export const dynamic = "force-dynamic";

/** Home is the task planner, not the feed. */
export default async function PlannerHomePage() {
  await requirePlannerPage();
  redirect("/planner/tasks");
}
