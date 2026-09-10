import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedTeamMemberBySlug, getPublishedTeamMembers } from "@/lib/team/load";
import TeamMemberExperience from "./TeamMemberExperience";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getPublishedTeamMemberBySlug(slug);
  if (!member) return { title: "Team | YourAILens Studios" };
  return {
    title: `${member.name} | Team | YourAILens Studios`,
    description: member.short_bio || member.role || `Studio profile for ${member.name}.`,
  };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getPublishedTeamMemberBySlug(slug);
  if (!member) notFound();
  return <TeamMemberExperience member={member} />;
}

export async function generateStaticParams() {
  try {
    const members = await getPublishedTeamMembers();
    return members.map((m) => ({ slug: m.slug }));
  } catch {
    return [];
  }
}
