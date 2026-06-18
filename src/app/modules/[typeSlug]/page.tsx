import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModuleTypeListExperience from "../ModuleTypeListExperience";
import { STUDIO_MODULE_TYPE_LABELS, studioModuleTypeFromSlug } from "@/data/studio-modules";

type Props = { params: Promise<{ typeSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { typeSlug } = await params;
  const type = studioModuleTypeFromSlug(typeSlug);
  if (!type) return { title: "Modules" };
  return {
    title: `${STUDIO_MODULE_TYPE_LABELS[type]} | Modules — YourAI Lens Studio`,
    description: `Browse ${STUDIO_MODULE_TYPE_LABELS[type].toLowerCase()} galleries.`,
  };
}

export default async function ModuleTypeListPage({ params }: Props) {
  const { typeSlug } = await params;
  const type = studioModuleTypeFromSlug(typeSlug);
  if (!type) notFound();
  return <ModuleTypeListExperience moduleType={type} />;
}
