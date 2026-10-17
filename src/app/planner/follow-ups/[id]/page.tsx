import { notFound } from "next/navigation";
import ContactDesk from "@/components/planner/ContactDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerContact, listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requirePlannerPage();
  const { id } = await params;
  const [contact, members] = await Promise.all([getPlannerContact(id), listPlannerMembers()]);
  if (!contact) notFound();
  return <ContactDesk me={me} members={members} initial={contact} />;
}
