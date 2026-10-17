import { notFound } from "next/navigation";
import LogCreate from "@/components/planner/LogCreate";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerContact } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewLogPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlannerPage();
  const { id } = await params;
  const contact = await getPlannerContact(id);
  if (!contact) notFound();
  return <LogCreate contact={contact} />;
}
