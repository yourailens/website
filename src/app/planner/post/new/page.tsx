import PostCreate from "@/components/planner/PostCreate";
import { requirePlannerPage } from "@/lib/planner/auth";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const me = await requirePlannerPage();
  return <PostCreate initial={me.display_name.slice(0, 1).toUpperCase()} />;
}
