"use client";

import OttChannelDesk from "@/components/ott/OttChannelDesk";
import type { OttCut } from "@/data/ott-cuts";

export default function AiFilmmakingExperience({ cuts }: { cuts: OttCut[] }) {
  return (
    <OttChannelDesk
      cuts={cuts}
      path="/ai-filmmaking"
      scene="02"
      title="AI films"
      blurb="Longer stories, returning characters, worlds you can walk into — from the desk."
      videoLabel="CUT"
      videoFilter="Cuts"
      emptyNone="No cuts on this channel yet"
      emptyHint="Films from the studio desk land here. Meanwhile, book a call and we’ll lock the first one."
    />
  );
}
