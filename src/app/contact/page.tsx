import type { Metadata } from "next";
import ContactExperience from "./ContactExperience";

const TITLE = "Contact | YourAILens Studios";
const DESCRIPTION = "Commission a world. Book a free 15-minute call with YourAILens Studios.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
};

export default function ContactPage() {
  return <ContactExperience />;
}
