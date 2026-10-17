import { notFound } from "next/navigation";
import PersonDesk from "@/components/planner/PersonDesk";
import { requirePlannerPage } from "@/lib/planner/auth";
import {
  getPlannerMemberBySlug,
  listPlannerMeetingsForMember,
  listPlannerNotes,
  listPlannerPosts,
  listPlannerTasks,
} from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export default async function PlannerPersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const me = await requirePlannerPage();
  const { slug } = await params;
  const person = await getPlannerMemberBySlug(slug);
  if (!person || !person.active) notFound();
  const [tasks, posts, notes, meetings] = await Promise.all([
    listPlannerTasks({ assigneeId: person.id }),
    listPlannerPosts({ authorId: person.id, limit: 40 }),
    listPlannerNotes(person.id),
    listPlannerMeetingsForMember(person.id),
  ]);
  return (
    <PersonDesk
      me={me}
      person={person}
      initialTasks={tasks}
      initialPosts={posts}
      initialNotes={notes}
      initialMeetings={meetings}
    />
  );
}
