import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModuleBySlug } from "@/lib/modules/load";
import ModuleDetailExperience from "./ModuleDetailExperience";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mod = await getModuleBySlug(slug);
  if (!mod) return { title: "Module | YourAI Lens Studio" };
  return {
    title: `${mod.title} | Modules | YourAI Lens Studio`,
    description: mod.tagline ?? mod.description ?? undefined,
  };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const mod = await getModuleBySlug(slug);
  if (!mod) notFound();
  return <ModuleDetailExperience mod={mod} />;
}
