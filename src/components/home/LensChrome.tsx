"use client";

import { useEffect, useState } from "react";

export const HOME_SCENES = [
  { id: "lens", sc: "1", slug: "INT. LENS" },
  { id: "ads", sc: "2", slug: "AI ADS" },
  { id: "films", sc: "3", slug: "AI FILMS" },
  { id: "community", sc: "4", slug: "COMMUNITY" },
  { id: "callsheet", sc: "5", slug: "CALL SHEET" },
] as const;

export function SceneRail() {
  const [active, setActive] = useState("lens");

  useEffect(() => {
    const nodes = HOME_SCENES.map((scene) => document.getElementById(scene.id)).filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-28% 0px -48% 0px", threshold: [0.15, 0.35, 0.6] }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Scenes"
      className="pointer-events-none fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 pl-5 xl:block"
    >
      <p className="pointer-events-none mb-4 font-mono text-[8px] tracking-[0.35em] text-white/25">SCENES</p>
      <ul className="pointer-events-auto space-y-1.5">
        {HOME_SCENES.map((scene) => {
          const on = active === scene.id;
          return (
            <li key={scene.id}>
              <a
                href={`#${scene.id}`}
                className={`flex items-baseline gap-2.5 py-0.5 text-[10px] tracking-[0.16em] transition ${
                  on ? "text-blue-400" : "text-white/28 hover:text-white/70"
                }`}
              >
                <span className={`font-mono ${on ? "text-blue-400" : "text-white/20"}`}>{scene.sc}</span>
                <span className={on ? "text-white" : ""}>{scene.slug}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Viewfinder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {children}
      <span className="pointer-events-none absolute left-4 top-20 z-20 h-7 w-7 border-l border-t border-white/45 sm:left-6" aria-hidden />
      <span className="pointer-events-none absolute right-4 top-20 z-20 h-7 w-7 border-r border-t border-white/45 sm:right-6" aria-hidden />
      <span className="pointer-events-none absolute bottom-4 left-4 z-20 h-7 w-7 border-b border-l border-white/45 sm:bottom-6 sm:left-6" aria-hidden />
      <span className="pointer-events-none absolute bottom-4 right-4 z-20 h-7 w-7 border-b border-r border-white/45 sm:bottom-6 sm:right-6" aria-hidden />
    </div>
  );
}
