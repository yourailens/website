import type { Metadata } from "next";
import ScenariosExperience from "./ScenariosExperience";
export const metadata: Metadata = { title: "Reference Scenarios — YourAILens Studios", description: "Browse AI-generated reference scenario sheets by type, setting, and mood." };
export const dynamic = "force-dynamic";
export default function ScenariosPage() { return <ScenariosExperience />; }
