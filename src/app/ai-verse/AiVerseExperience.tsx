"use client";

import OttChannelDesk from "@/components/ott/OttChannelDesk";
import type { OttCut } from "@/data/ott-cuts";

export default function AiVerseExperience({ cuts }: { cuts: OttCut[] }) {
  return (
    <OttChannelDesk
      cuts={cuts}
      path="/ai-verse"
      scene="03"
      title="AI community"
      blurb="Cuts from the lot and the feed. Studio floor, share, community — from the desk."
      videoLabel="TAKE"
      videoFilter="Takes"
      emptyNone="No takes on this channel yet"
      emptyHint="Community cuts from the studio desk land here. Meanwhile, drop something in and we’ll put it on the board."
    />
  );
}
