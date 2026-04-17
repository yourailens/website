import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Images | YourAILens Studios",
  description: "Production stills, campaigns, and AI creative imagery from YourAILens Studios.",
};

export default function ImagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
