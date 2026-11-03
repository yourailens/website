import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CommunityWatch from "@/components/community/CommunityWatch";
import { getPublishedCommunityPiece } from "@/lib/community/load";
import { canonicalPublicUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const piece = await getPublishedCommunityPiece(id);
  if (!piece) return { title: "Community | YourAILens Studios" };

  const title = `${piece.title} | YourAILens Studios`;
  const description = piece.description || `${piece.title} from the YourAILens AI Creators Community.`;
  const pageUrl = canonicalPublicUrl(`/ai-verse/${piece.id}`);
  const image = piece.frame_stills[0]?.url || piece.poster_url || (piece.media_type === "image" ? piece.media_url : null);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "YourAILens Studios",
      type: piece.media_type === "video" ? "video.other" : "website",
      ...(image ? { images: [{ url: image, alt: piece.title }] } : {}),
    },
  };
}

export default async function CommunityPiecePage({ params }: Props) {
  const { id } = await params;
  const piece = await getPublishedCommunityPiece(id);
  if (!piece) notFound();
  return <CommunityWatch piece={piece} />;
}
