import type { Metadata } from "next";
import { getPublishedTeamMembers } from "@/lib/team/load";
import TeamHubExperience from "./TeamHubExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team | YourAILens Studios",
  description: "Meet the people behind YourAILens Studios — roles, profiles, and selected work.",
};

export default async function TeamPage() {
  const members = await getPublishedTeamMembers();
  return <TeamHubExperience members={members} />;
}
