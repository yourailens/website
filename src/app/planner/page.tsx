import FeedHome from "@/components/planner/FeedHome";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerPosts } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerHomePage() {
  const me = await requirePlannerPage();
  const posts = await listPlannerPosts({ limit: 80 });
  return <FeedHome me={me} initialPosts={posts} />;
}
