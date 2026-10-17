import DirectoryForm from "@/components/planner/DirectoryForm";
import { requirePlannerPage } from "@/lib/planner/auth";

export const dynamic = "force-dynamic";

export default async function NewDirectoryPage() {
  await requirePlannerPage();
  return <DirectoryForm />;
}
