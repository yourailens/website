"use client";

import { useRef, useState } from "react";
import HeroSoundBanner from "@/components/home/HeroSoundBanner";
import HomeBelowHero from "@/components/home/HomeBelowHero";
import HomeHero from "@/components/home/HomeHero";

export type SoundHeroLead = {
  label: string;
  title: string;
  src: string | null;
  poster: string | null;
  youtubeId: string | null;
};

export default function HomeSoundHero({ lead }: { lead: SoundHeroLead | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const node = videoRef.current;
    const next = !(node ? node.muted : muted);
    if (node) {
      node.muted = next;
      if (!next) {
        node.volume = 1;
        void node.play().catch(() => {});
      }
    }
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: [] }),
      "*"
    );
    setMuted(next);
  };

  const onSurfaceClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button")) return;
    toggle();
  };

  return (
    <div className="relative">
      <HeroSoundBanner muted={muted} onToggle={toggle} />
      {lead ? (
        <HomeBelowHero
          label={lead.label}
          title={lead.title}
          src={lead.src}
          poster={lead.poster}
          youtubeId={lead.youtubeId}
          muted={muted}
          onSurfaceClick={onSurfaceClick}
          videoRef={videoRef}
          frameRef={frameRef}
        />
      ) : (
        <HomeHero muted={muted} onSurfaceClick={onSurfaceClick} videoRef={videoRef} />
      )}
    </div>
  );
}
