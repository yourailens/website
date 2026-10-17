import { notFound } from "next/navigation";
import DirectoryForm from "@/components/planner/DirectoryForm";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerDirectoryItem } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function EditDirectoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlannerPage();
  const { id } = await params;
  const item = await getPlannerDirectoryItem(id);
  if (!item) notFound();
  return <DirectoryForm initial={item} />;
}
