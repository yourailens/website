import type { Metadata } from "next";
import { Suspense } from "react";
import ModulesHubExperience from "./ModulesHubExperience";

export const metadata: Metadata = {
  title: "Modules | YourAI Lens Studio",
  description:
    "Director playbooks for AI production — camera, lighting, lens, workflow, models, prompts, and assets. AI that doesn't look like AI.",
};

export default function ModulesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7fc]" />}>
      <ModulesHubExperience />
    </Suspense>
  );
}
