import { notFound } from "next/navigation";
import BioForm from "@/components/planner/BioForm";
import { draftFromBio, plannerBioSuggestions } from "@/data/planner";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerBio, listPlannerBios, listPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function EditBioPage({ params }: { params: Promise<{ slug: string }> }) {
  const me = await requirePlannerPage();
  const { slug } = await params;
  const [bio, { rows }, members] = await Promise.all([getPlannerBio(slug), listPlannerBios(), listPlannerMembers()]);
  if (!bio) notFound();
  return <BioForm me={me} members={members} suggestions={plannerBioSuggestions(rows)} initial={draftFromBio(bio)} bioId={bio.id} />;
}
