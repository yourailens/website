import type { CommunityPiece, CommunityRailCard } from "@/data/community";
import { HOME_WATCH_TITLES } from "@/data/home-watch";

function fromPiece(piece: CommunityPiece): CommunityRailCard {
  return {
    id: piece.id,
    title: piece.title,
    description: piece.description,
    href: `/ai-verse/${piece.id}`,
    mediaType: piece.media_type,
    mediaUrl: piece.media_url,
    posterUrl: piece.poster_url,
  };
}

function fallbackCards(): CommunityRailCard[] {
  return HOME_WATCH_TITLES.filter((item) => item.rail === "community" && item.video).map((item) => ({
    id: item.slug,
    title: item.title,
    description: item.description,
    href: "/ai-verse",
    mediaType: "video" as const,
    mediaUrl: item.video as string,
    posterUrl: item.poster,
  }));
}

export function communityHomeCards(pieces: CommunityPiece[]): CommunityRailCard[] {
  const picked = pieces.filter((piece) => piece.show_on_home).map(fromPiece);
  return picked.length ? picked : fallbackCards();
}
