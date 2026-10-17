"use client";

import Link from "next/link";
import type { PlannerMember, PlannerPost } from "@/data/planner";
import PlannerMore from "@/components/planner/PlannerMore";

const EDGES = ["#5b8cff", "#2dd4bf", "#f5a524", "#c084fc", "#4ade80", "#fb7185", "#38bdf8", "#f472b6"];

function edgeFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i) * (i + 3)) % EDGES.length;
  return EDGES[h];
}

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function PostCard({
  post,
  me,
  onDelete,
}: {
  post: PlannerPost;
  me: PlannerMember;
  onDelete?: (id: string) => void;
}) {
  const canDelete = post.author_id === me.id || me.is_ceo;
  const name = post.author?.display_name ?? "Unknown";
  const edge = edgeFor(post.author?.display_name || post.id);
  const shot = post.images?.[0];

  return (
    <article className="relative flex aspect-square flex-col overflow-hidden rounded-[32px] border border-white/18 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-white" style={{ background: edge }}>
        <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
          {post.author?.role_title || "Team"}
        </span>
        <span className="shrink-0 text-[11px] font-medium text-white/80">{when(post.created_at)}</span>
      </div>
      {canDelete && onDelete ? (
        <div className="absolute right-3 top-12">
          <PlannerMore label="Delete" onSelect={() => onDelete(post.id)} />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-4">
        <p className={`font-semibold leading-[1.35] text-white ${shot ? "line-clamp-4 text-[18px]" : "line-clamp-7 text-[20px]"}`}>
          {post.body}
        </p>
        {shot ? (
          <div className="mt-3 overflow-hidden rounded-[18px] border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.url} alt={shot.label || ""} className="h-16 w-full object-cover" />
          </div>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-3">
          <Link
            href={post.author ? `/planner/people/${post.author.slug}` : "/planner"}
            className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[11px] font-medium text-white/55"
          >
            {post.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              name.slice(0, 1).toUpperCase()
            )}
          </Link>
          {post.author ? (
            <Link href={`/planner/people/${post.author.slug}`} className="min-w-0 truncate text-[12px] text-white/45">
              {name}
            </Link>
          ) : (
            <span className="min-w-0 truncate text-[12px] text-white/45">{name}</span>
          )}
        </div>
      </div>
    </article>
  );
}
