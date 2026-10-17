import BioForm from "@/components/planner/BioForm";
import { plannerBioSuggestions } from "@/data/planner";
import { requirePlannerPage } from "@/lib/planner/auth";
import { listPlannerBios, listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewBioPage() {
  const me = await requirePlannerPage();
  const [{ rows }, members] = await Promise.all([listPlannerBios(), listPlannerMembers()]);
  return <BioForm me={me} members={members} suggestions={plannerBioSuggestions(rows)} />;
}
