import type { Metadata } from "next";
import PackageDetailExperience from "./PackageDetailExperience";
import { loadPublicService } from "@/lib/services/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await loadPublicService(slug);
  if (!service) return { title: "Package | YourAI Lens Studio" };
  return {
    title: `${service.name} | Pricing · YourAI Lens Studio`,
    description: service.tagline ?? service.description ?? `${service.name} package details.`,
  };
}

export default function PackageDetailPage() {
  return <PackageDetailExperience />;
}
