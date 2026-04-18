"use client";

import { useState } from "react";

export default function CopyUrlButton({
  className,
  idleLabel = "Copy URL",
  copiedLabel = "Copied!",
}: {
  className?: string;
  /** Default: Copy URL */
  idleLabel?: string;
  /** Default: Copied! */
  copiedLabel?: string;
}) {
  const [label, setLabel] = useState(idleLabel);

  async function copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLabel(copiedLabel);
      window.setTimeout(() => setLabel(idleLabel), 1600);
    } catch {
      setLabel("Failed");
      window.setTimeout(() => setLabel(idleLabel), 1600);
    }
  }

  return (
    <button type="button" onClick={copyCurrentUrl} className={className}>
      {label}
    </button>
  );
}
