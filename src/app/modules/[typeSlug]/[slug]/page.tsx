import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModuleGalleryExperience from "../../ModuleGalleryExperience";
import { getStudioModuleBySlug } from "@/lib/studio-modules/load";
import { studioModuleTypeFromSlug } from "@/data/studio-modules";

type Props = { params: Promise<{ typeSlug: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { typeSlug, slug } = await params;
  const type = studioModuleTypeFromSlug(typeSlug);
  if (!type) return { title: "Module" };
  const mod = await getStudioModuleBySlug(type, slug);
  if (!mod) return { title: "Module" };
  return {
    title: `${mod.title} | YourAI Lens Studio`,
    description: mod.description ?? `Gallery: ${mod.title}`,
    openGraph: mod.cover_image_url ? { images: [{ url: mod.cover_image_url }] } : undefined,
  };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { typeSlug, slug } = await params;
  const type = studioModuleTypeFromSlug(typeSlug);
  if (!type) notFound();

  const mod = await getStudioModuleBySlug(type, slug);
  if (!mod) notFound();

  return <ModuleGalleryExperience mod={mod} />;
}
