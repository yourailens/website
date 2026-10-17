import DirectoryDesk from "@/components/planner/DirectoryDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerDirectory } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerDirectoryPage() {
  await requirePlannerPage();
  const { rows, missing } = await listPlannerDirectory();
  return <DirectoryDesk items={rows} missing={missing} />;
}
