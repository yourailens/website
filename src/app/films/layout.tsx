import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Films | YourAILens Studios",
  description: "Motion work, brand films, and AI assisted video production from YourAILens Studios.",
};

export default function FilmsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
