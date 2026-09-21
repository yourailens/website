"use client";

import Navbar from "@/components/Navbar";

export function TheFutureChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black font-body text-white">{children}</div>
    </>
  );
}
