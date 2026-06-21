import type { Metadata } from "next";
import ModulesHubExperience from "./ModulesHubExperience";

export const metadata: Metadata = {
  title: "Modules | YourAI Lens Studio",
  description:
    "Prompt playbooks, client showcases, and subjects & visuals — shareable galleries with copy-ready prompts.",
};

export default function ModulesPage() {
  return <ModulesHubExperience />;
}
