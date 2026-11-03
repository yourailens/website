import type { Metadata } from "next";
import CommunityPromo from "@/components/community/CommunityPromo";
import { piecesByPlacement, getCommunitySite, getPublishedCommunityPieces } from "@/lib/community/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCommunitySite();
  const description = site.lede || `${site.title} — ${site.member_count} ${site.member_label}.`;
  return {
    title: `${site.title} | YourAILens Studios`,
    description,
    openGraph: {
      title: `${site.title} | YourAILens Studios`,
      description,
      url: "/ai-verse",
    },
  };
}

export default async function AiVersePage() {
  const [site, pieces] = await Promise.all([getCommunitySite(), getPublishedCommunityPieces()]);
  return (
    <CommunityPromo
      site={site}
      heroes={piecesByPlacement(pieces, "hero")}
      jumbos={piecesByPlacement(pieces, "jumbo")}
      gallery={piecesByPlacement(pieces, "gallery")}
    />
  );
}
