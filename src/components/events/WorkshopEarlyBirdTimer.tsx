"use client";

import { useEffect, useState } from "react";
import { WORKSHOP_EARLY_BIRD_END_ISO } from "@/lib/events/workshop-config";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function WorkshopEarlyBirdTimer() {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const end = new Date(WORKSHOP_EARLY_BIRD_END_ISO).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, end - now);
      if (diff === 0) {
        setEnded(true);
        setLeft(null);
        return;
      }
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setLeft({ d, h, m, s: sec });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (ended) {
    return <span className="text-amber-100/90">Early bird pricing has ended.</span>;
  }
  if (!left) {
    return <span className="text-blue-100/80">Loading timer…</span>;
  }
  return (
    <span className="tabular-nums">
      Ends in <strong>{left.d}</strong>d <strong>{pad(left.h)}</strong>:<strong>{pad(left.m)}</strong>:<strong>{pad(left.s)}</strong>
    </span>
  );
}
