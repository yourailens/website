import type { Metadata } from "next";
import WebDevExperience from "./WebDevExperience";

const TITLE = "YAIL WebDev | YourAILens Studios";
const DESCRIPTION =
  "Full stack websites built with the latest stack and AI integration. From landing pages to products, by YourAILens Studios.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
};

export default function WebDevPage() {
  return <WebDevExperience />;
}
