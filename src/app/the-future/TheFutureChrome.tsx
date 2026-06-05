"use client";

import Navbar from "@/components/Navbar";

export function TheFutureChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7fc] font-body text-slate-900">{children}</div>
    </>
  );
}
