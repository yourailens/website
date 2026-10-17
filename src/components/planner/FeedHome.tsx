"use client";

import { useState } from "react";
import type { PlannerMember, PlannerPost } from "@/data/planner";
import PlannerConfirm from "@/components/planner/PlannerConfirm";
import PostCard from "@/components/planner/PostCard";
import { DashHero, Stat } from "@/components/planner/planner-look";
import { P_PAGE } from "@/components/planner/planner-ui";

export default function FeedHome({
  me,
  initialPosts,
}: {
  me: PlannerMember;
  initialPosts: PlannerPost[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function deletePost() {
    if (!pendingId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/posts/${pendingId}`, { method: "DELETE" });
      const j = (await res.json().catch(() => ({}))) as { posts?: PlannerPost[] };
      if (res.ok) setPosts(j.posts ?? []);
      setPendingId(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={P_PAGE}>
      <DashHero
        eyebrow={`Welcome, ${me.display_name.split(" ")[0]}`}
        title="The floor"
        text="What the team is talking about. Tasks live on the planner."
        href="/planner/post/new"
        action="New post"
      >
        <Stat label="Posts" value={posts.length} />
      </DashHero>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((p) => (
          <li key={p.id}>
            <PostCard post={p} me={me} onDelete={(id) => setPendingId(id)} />
          </li>
        ))}
      </ul>
      {!posts.length ? <p className="text-sm text-white/50">Nothing posted yet.</p> : null}

      <PlannerConfirm
        open={Boolean(pendingId)}
        title="Delete this post?"
        body="This removes the post from the feed. You cannot undo it."
        confirmLabel="Delete post"
        busy={busy}
        onCancel={() => setPendingId(null)}
        onConfirm={() => void deletePost()}
      />
    </div>
  );
}
