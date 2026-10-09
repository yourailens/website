import type { Metadata } from "next";
import VaultExperience from "@/components/vault/VaultExperience";
import {
  getFeaturedVaultEntry,
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
} from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "YAIL Vault | YourAILens Studios",
  description:
    "GenAI labs for AI Filmmaking and AI Ads — experiments, notes, and cuts from the YourAILens desk.",
  openGraph: {
    title: "YAIL Vault | YourAILens Studios",
    description: "Enter the world of AI filmmaking and ads labs.",
    url: "/vault",
  },
};

type Props = {
  searchParams: Promise<{ view?: string | string[] }>;
};

function parseView(raw: string | string[] | undefined): "all" | "filmmaking" | "ads" | "avatars" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "filmmaking" || value === "ads" || value === "avatars") return value;
  return "all";
}

export default async function VaultPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialView = parseView(params.view);

  const [featured, filmmaking, ads, avatars] = await Promise.all([
    getFeaturedVaultEntry(),
    getPublishedVaultEntries("filmmaking"),
    getPublishedVaultEntries("ads"),
    getPublishedVaultAvatars(),
  ]);

  return (
    <VaultExperience
      featured={featured}
      filmmaking={filmmaking}
      ads={ads}
      avatars={avatars}
      initialView={initialView}
    />
  );
}
