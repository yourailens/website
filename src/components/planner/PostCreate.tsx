"use client";

import { useRouter } from "next/navigation";
import FeedComposer from "@/components/planner/FeedComposer";
import { DashHero } from "@/components/planner/planner-look";
import { P_PAGE } from "@/components/planner/planner-ui";

export default function PostCreate({ initial }: { initial: string }) {
  const router = useRouter();
  return (
    <div className={P_PAGE}>
      <DashHero
        eyebrow="New post"
        title="Tell the studio"
        text="This shows on the feed and on your page. Paste a screenshot if you have one."
      />
      <FeedComposer
        initial={initial}
        onPosted={() => {
          router.push("/planner");
          router.refresh();
        }}
      />
    </div>
  );
}
