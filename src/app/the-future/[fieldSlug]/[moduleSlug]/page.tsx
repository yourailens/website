import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFutureModuleBySlugs, incrementFutureModuleView } from "@/lib/the-future/load";
import TheFutureModuleExperience from "./TheFutureModuleExperience";

type Props = { params: Promise<{ fieldSlug: string; moduleSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fieldSlug, moduleSlug } = await params;
  const data = await getFutureModuleBySlugs(fieldSlug, moduleSlug);
  if (!data) return { title: "The Future | YourAI Lens Studio" };
  return {
    title: `${data.title} | ${data.field.title} | The Future`,
    description: data.tagline ?? data.intro ?? undefined,
  };
}

export default async function TheFutureModulePage({ params }: Props) {
  const { fieldSlug, moduleSlug } = await params;
  const data = await getFutureModuleBySlugs(fieldSlug, moduleSlug);
  if (!data) notFound();
  await incrementFutureModuleView(data.id);
  const { field, ...mod } = data;
  return <TheFutureModuleExperience field={field} mod={mod} />;
}
