import { notFound } from "next/navigation";
import NoteCreate from "@/components/planner/NoteCreate";
import { requirePlannerPage } from "@/lib/planner/auth";
import { getPlannerMemberBySlug } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function NewNotePage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePlannerPage();
  const { slug } = await params;
  const person = await getPlannerMemberBySlug(slug);
  if (!person || !person.active) notFound();
  return <NoteCreate person={person} />;
}
