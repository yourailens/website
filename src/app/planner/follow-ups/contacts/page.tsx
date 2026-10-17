import ContactsDesk from "@/components/planner/ContactsDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerBios } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const me = await requirePlannerPage();
  const { rows, missing } = await listPlannerBios();
  return <ContactsDesk me={me} bios={rows} missing={missing} />;
}
