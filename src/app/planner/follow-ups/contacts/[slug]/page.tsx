import { notFound } from "next/navigation";
import BioSheet from "@/components/planner/BioSheet";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerBio } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function BioPage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePlannerPage();
  const { slug } = await params;
  const bio = await getPlannerBio(slug);
  if (!bio) notFound();
  return <BioSheet bio={bio} />;
}
