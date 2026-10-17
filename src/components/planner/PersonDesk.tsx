"use client";

import Link from "next/link";
import { useState } from "react";
import type { PlannerMeeting, PlannerMember, PlannerNote, PlannerPost, PlannerTask } from "@/data/planner";
import PostCard from "@/components/planner/PostCard";
import TaskCard from "@/components/planner/TaskCard";
import { Stat } from "@/components/planner/planner-look";
import { P_BTN, P_GLASS, P_PAGE } from "@/components/planner/planner-ui";

export default function PersonDesk({
  me,
  person,
  initialTasks,
  initialPosts,
  initialNotes,
  initialMeetings,
}: {
  me: PlannerMember;
  person: PlannerMember;
  initialTasks: PlannerTask[];
  initialPosts: PlannerPost[];
  initialNotes: PlannerNote[];
  initialMeetings: PlannerMeeting[];
}) {
  const isOwn = me.id === person.id;
  const [posts, setPosts] = useState(initialPosts);
  const [err, setErr] = useState("");
  const open = initialTasks.filter((t) => t.status !== "done").length;

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/planner/posts/${id}`, { method: "DELETE" });
    const j = (await res.json().catch(() => ({}))) as { posts?: PlannerPost[]; error?: string };
    if (res.ok) setPosts((j.posts ?? []).filter((p) => p.author_id === person.id));
    else setErr(j.error || "Delete failed");
  }

  return (
    <div className={P_PAGE}>
      <section className={`flex flex-wrap items-end justify-between gap-6 px-6 py-8 sm:px-10 ${P_GLASS}`}>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">People</p>
            <h2 className="mt-2 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[0.95]">{person.display_name}</h2>
            <p className="mt-3 text-[15px] text-white/75">{[person.role_title, isOwn ? "You" : null].filter(Boolean).join(", ")}</p>
            {person.bio ? <p className="mt-3 max-w-xl text-[15px] text-white/80">{person.bio}</p> : null}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
              <Stat label="Open tasks" value={open} tone="text-[#fbbf24]" />
              <Stat label="Meetings" value={initialMeetings.length} />
              <Stat label="Notes" value={initialNotes.length} />
              <Stat label="Posts" value={posts.length} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/planner/people/${person.slug}/notes/new`} className={P_BTN}>
              New note
            </Link>
            <Link href={`/planner/people/${person.slug}/meetings/new`} className="rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-[14px] font-medium text-white">
              New meeting
            </Link>
            {isOwn ? (
              <Link href="/planner/post/new" className="rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-[14px] font-medium text-white">
                New post
              </Link>
            ) : null}
          </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-[20px] font-bold">Tasks</h3>
          <Link href="/planner/tasks/new" className="text-[14px] text-white/60 hover:text-white">
            New task
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {initialTasks.filter((t) => t.status !== "done").map((t) => (
            <li key={t.id}>
              <TaskCard task={t} mine={t.assignee_id === me.id} />
            </li>
          ))}
        </ul>
        {!initialTasks.some((t) => t.status !== "done") ? <p className="text-sm text-white/50">No open tasks.</p> : null}
        <h3 className="mb-3 mt-8 text-[20px] font-bold">Completed</h3>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {initialTasks.filter((t) => t.status === "done").map((t) => (
            <li key={t.id}>
              <TaskCard task={t} mine={t.assignee_id === me.id} />
            </li>
          ))}
        </ul>
        {!initialTasks.some((t) => t.status === "done") ? <p className="text-sm text-white/50">Nothing completed yet.</p> : null}
      </section>

      <section>
        <h3 className="mb-3 text-[20px] font-bold">Meetings</h3>
        <ul className="grid gap-5 lg:grid-cols-2">
          {initialMeetings.map((m) => (
            <li key={m.id} className={`flex aspect-square flex-col p-5 ${P_GLASS}`}>
              <p className="text-[22px] font-bold leading-tight">{m.title}</p>
              <p className="mt-1 text-[13px] text-white/55">{m.starts_at ? new Date(m.starts_at).toLocaleString() : "No time set"}</p>
              {m.notes ? <p className="mt-2 text-[14px] text-white/70">{m.notes}</p> : null}
            </li>
          ))}
        </ul>
        {!initialMeetings.length ? <p className="text-sm text-white/50">No meetings logged.</p> : null}
      </section>

      <section>
        <h3 className="mb-3 text-[20px] font-bold">Notes</h3>
        <ul className="grid gap-5 lg:grid-cols-2">
          {initialNotes.map((n) => (
            <li key={n.id}>
              <Link href={`/planner/people/${person.slug}/notes/${n.id}`} className={`flex aspect-square flex-col p-5 ${P_GLASS}`}>
                <p className="text-[22px] font-bold leading-tight">{n.title}</p>
                <p className="mt-1 text-[12px] text-white/45">
                  Updated {new Date(n.updated_at).toLocaleString()}
                  {n.images.length ? `, ${n.images.length} image${n.images.length === 1 ? "" : "s"}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        {!initialNotes.length ? <p className="text-sm text-white/50">No notes yet.</p> : null}
      </section>

      <section>
        <h3 className="mb-3 text-[20px] font-bold">Posts</h3>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id}>
              <PostCard post={p} me={me} onDelete={(id) => void deletePost(id)} />
            </li>
          ))}
        </ul>
        {!posts.length ? <p className="text-sm text-white/50">No posts yet.</p> : null}
      </section>
      {err ? <p className="text-sm text-rose-300">{err}</p> : null}
    </div>
  );
}
