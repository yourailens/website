import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAvatarSlug } from "@/lib/avatars/config";
import { getAvatarBySlug } from "@/lib/avatars/load";
import AvatarProfileExperience from "./AvatarProfileExperience";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isAvatarSlug(slug)) return { title: "Avatar | YourAILens Studios" };
  const row = await getAvatarBySlug(slug);
  if (!row) return { title: "Avatar | YourAILens Studios" };
  return {
    title: `${row.displayName} | Avatars | YourAILens Studios`,
    description: row.headline || `Learn about ${row.displayName}.`,
  };
}

export default async function AvatarProfilePage({ params }: Props) {
  const { slug } = await params;
  if (!isAvatarSlug(slug)) notFound();
  const avatar = await getAvatarBySlug(slug);
  if (!avatar) notFound();
  return <AvatarProfileExperience avatar={avatar} />;
}
