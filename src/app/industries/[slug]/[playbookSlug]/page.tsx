import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPlaybookStaticParams, getPlaybookPage } from "@/lib/industries/load";
import PlaybookMagazineExperience from "./PlaybookMagazineExperience";

type Props = { params: Promise<{ slug: string; playbookSlug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllPlaybookStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, playbookSlug } = await params;
  const data = await getPlaybookPage(slug, playbookSlug);
  if (!data) return { title: "YourAI Lens Studio" };
  const title = data.playbook.question?.trim() || data.playbook.name;
  return {
    title: `${title}, ${data.industry.name} | YourAI Lens Studio`,
    description:
      data.playbook.answer?.slice(0, 160) ??
      data.playbook.tagline ??
      data.playbook.description ??
      undefined,
  };
}

export default async function PlaybookPage({ params }: Props) {
  const { slug, playbookSlug } = await params;
  const data = await getPlaybookPage(slug, playbookSlug);
  if (!data) notFound();
  return <PlaybookMagazineExperience data={data} />;
}
