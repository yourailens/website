import { notFound } from "next/navigation";
import ContactFile from "@/components/planner/ContactFile";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerContact, listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerContactFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requirePlannerPage();
  const { id } = await params;
  const [contact, members] = await Promise.all([getPlannerContact(id), listPlannerMembers()]);
  if (!contact) notFound();
  return <ContactFile me={me} members={members} initial={contact} />;
}
