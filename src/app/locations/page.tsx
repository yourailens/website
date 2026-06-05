import type { Metadata } from "next";
import LocationsExperience from "./LocationsExperience";
export const metadata: Metadata = { title: "Location Library — YourAILens Studios", description: "Browse AI-generated location and background reference sheets." };
export const dynamic = "force-dynamic";
export default function LocationsPage() { return <LocationsExperience />; }
