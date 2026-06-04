import type { IndustryPlaybookWithExamples, PlaybookCoverPreview } from "@/data/industries";
import { resolvePlaybookCoverExample } from "@/lib/industries/resolve-hero-media";
import type { PlaybookItem } from "./PlaybookShowcase";

function coverFromPlaybook(pb: IndustryPlaybookWithExamples): PlaybookCoverPreview | null {
  if (pb.cover_preview) return pb.cover_preview;
  const ex = resolvePlaybookCoverExample(pb.examples);
  if (!ex) return null;
  return {
    media_url: ex.media_url,
    media_type: ex.media_type,
    poster_url: ex.poster_url,
    aspect_ratio: ex.aspect_ratio,
    title: ex.title,
    caption: ex.caption,
  };
}

export function toPlaybookListItems(playbooks: IndustryPlaybookWithExamples[]): PlaybookItem[] {
  return playbooks.map((pb) => ({
    id: pb.id,
    slug: pb.slug,
    name: pb.name,
    tagline: pb.tagline,
    example_count: pb.example_count,
    cover: coverFromPlaybook(pb),
  }));
}
