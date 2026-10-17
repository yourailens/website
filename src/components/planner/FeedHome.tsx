"use client";

import { useState } from "react";
import type { PlannerMember, PlannerPost } from "@/data/planner";
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

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/planner/posts/${id}`, { method: "DELETE" });
    const j = (await res.json().catch(() => ({}))) as { posts?: PlannerPost[] };
    if (res.ok) setPosts(j.posts ?? []);
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
            <PostCard post={p} me={me} onDelete={(id) => void deletePost(id)} />
          </li>
        ))}
      </ul>
      {!posts.length ? <p className="text-sm text-white/50">Nothing posted yet.</p> : null}
    </div>
  );
}
