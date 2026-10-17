import { notFound } from "next/navigation";
import MeetingCreate from "@/components/planner/MeetingCreate";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerMemberBySlug } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewMeetingPage({ params }: { params: Promise<{ slug: string }> }) {
  const me = await requirePlannerPage();
  const { slug } = await params;
  const person = await getPlannerMemberBySlug(slug);
  if (!person || !person.active) notFound();
  return <MeetingCreate me={me} person={person} />;
}
