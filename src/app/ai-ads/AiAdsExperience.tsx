"use client";

import OttChannelDesk from "@/components/ott/OttChannelDesk";
import type { OttCut } from "@/data/ott-cuts";

export default function AiAdsExperience({ cuts }: { cuts: OttCut[] }) {
  return (
    <OttChannelDesk
      cuts={cuts}
      path="/ai-ads"
      scene="01"
      title="AI ads"
      blurb="Commercials that feel shot. Product, launch, campaign — from the desk."
      videoLabel="SPOT"
      videoFilter="Spots"
      emptyNone="No spots on this channel yet"
      emptyHint="Cuts from the studio desk land here. Meanwhile, book a call and we’ll build the first one."
    />
  );
}
