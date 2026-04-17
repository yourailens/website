"use client";

import { useState } from "react";

export default function CopyUrlButton({ className }: { className?: string }) {
  const [label, setLabel] = useState("Copy URL");

  async function copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLabel("Copied!");
      window.setTimeout(() => setLabel("Copy URL"), 1600);
    } catch {
      setLabel("Failed");
      window.setTimeout(() => setLabel("Copy URL"), 1600);
    }
  }

  return (
    <button type="button" onClick={copyCurrentUrl} className={className}>
      {label}
    </button>
  );
}
