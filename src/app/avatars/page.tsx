import type { Metadata } from "next";
import { getAvatarSummaries } from "@/lib/avatars/load";
import AvatarHubExperience from "./AvatarHubExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Avatars | YourAILens Studios",
  description: "Meet Kaira, Akriti, Niharika, and Akanksha — the characters behind YourAILens Studios.",
};

export default async function AvatarsPage() {
  const avatars = await getAvatarSummaries();
  return <AvatarHubExperience avatars={avatars} />;
}
