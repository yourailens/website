import ContactCreate from "@/components/planner/ContactCreate";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerBios, listPlannerContacts, listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewContactPage() {
  const me = await requirePlannerPage();
  const [members, bios, existing] = await Promise.all([listPlannerMembers(), listPlannerBios(), listPlannerContacts()]);
  return <ContactCreate me={me} members={members} people={bios.rows} existing={existing} />;
}
