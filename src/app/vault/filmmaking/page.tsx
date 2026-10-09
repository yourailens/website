import type { Metadata } from "next";
import VaultFilmmakingExperience from "@/components/vault/VaultFilmmakingExperience";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
} from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Filmmaking | YAIL Vault",
  description: "GenAI filmmaking labs from YAIL Vault — browsed by genre.",
  openGraph: {
    title: "AI Filmmaking | YAIL Vault",
    description: "GenAI filmmaking labs from YAIL Vault — browsed by genre.",
    url: "/vault/filmmaking",
  },
};

export default async function VaultFilmmakingPage() {
  const [filmmaking, ads, avatars] = await Promise.all([
    getPublishedVaultEntries("filmmaking"),
    getPublishedVaultEntries("ads"),
    getPublishedVaultAvatars(),
  ]);

  return (
    <VaultFilmmakingExperience filmmaking={filmmaking} ads={ads} avatars={avatars} />
  );
}
