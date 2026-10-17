"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { PlannerTask } from "@/data/planner";
import { PlannerFace } from "@/components/planner/planner-look";

function when(deadline: string | null) {
  if (!deadline) return "No date";
  const d = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Full notes by default; ellipsis only when the text overflows the card space. */
function TaskNotes({ text, empty }: { text: string; empty: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLParagraphElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const boxEl = box.current;
    const probeEl = probe.current;
    if (!boxEl || !probeEl) return;
    const check = () => setOverflowing(probeEl.scrollHeight > boxEl.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(boxEl);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div ref={box} className="relative mt-2 min-h-0 flex-1 overflow-hidden">
      <p
        ref={probe}
        aria-hidden
        className="pointer-events-none invisible absolute inset-x-0 top-0 text-[14px] leading-[1.5] break-words"
      >
        {text}
      </p>
      <p
        className={`text-[14px] leading-[1.5] break-words ${empty ? "text-white/35" : "text-white/70"} ${
          overflowing ? "line-clamp-6" : ""
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function Mark({ kind }: { kind: "tick" | "cross" }) {
  return kind === "tick" ? (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function TaskCard({ task, mine }: { task: PlannerTask; mine: boolean }) {
  const router = useRouter();
  const [done, setDone] = useState(task.status === "done");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDone(task.status === "done");
  }, [task.status]);

  const who = task.assignee?.display_name ?? "Unassigned";

  async function setStatus(nextDone: boolean) {
    if (!mine || busy || nextDone === done) return;
    setDone(nextDone);
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextDone ? "done" : "open" }),
      });
      if (!res.ok) setDone(!nextDone);
      else router.refresh();
    } catch {
      setDone(!nextDone);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="flex aspect-square flex-col overflow-hidden rounded-[36px] border border-white/20 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-2xl">
      <div
        className={`flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-semibold tracking-wide text-white ${
          done ? "bg-[#34c759]" : "bg-[#ff3b30]"
        }`}
      >
        <Mark kind={done ? "tick" : "cross"} />
        {done ? "Done" : "Not done"}
      </div>

      <Link href={`/planner/tasks/${task.id}`} className="flex min-h-0 flex-1 flex-col px-5 pb-2 pt-4">
        <h3 className={`shrink-0 line-clamp-2 text-[22px] font-bold leading-[1.15] tracking-tight ${done ? "text-white/55" : "text-white"}`}>
          {task.title}
        </h3>
        <TaskNotes text={task.notes || "No notes"} empty={!task.notes} />
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="flex min-w-0 items-center gap-2">
            <PlannerFace name={who} size={28} />
            <span className="truncate text-[13px] font-semibold text-white">{who}</span>
          </span>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium text-white/70">{when(task.deadline)}</span>
        </div>
      </Link>

      <div
        className={`mx-4 mb-4 flex items-center justify-center gap-2 rounded-full border p-1.5 ${
          mine
            ? "border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <button
          type="button"
          disabled={!mine || busy}
          aria-pressed={!done}
          aria-label={mine ? "Mark not done" : "Only the assignee can change this"}
          onClick={() => void setStatus(false)}
          className={`flex h-12 flex-1 items-center justify-center rounded-full ${
            !mine
              ? done
                ? "text-white/25"
                : "bg-white/10 text-white/35"
              : done
                ? "text-white/55"
                : "bg-[#ff3b30] text-white shadow-[0_8px_18px_-8px_rgba(255,59,48,0.9)]"
          }`}
        >
          <Mark kind="cross" />
        </button>
        <button
          type="button"
          disabled={!mine || busy}
          aria-pressed={done}
          aria-label={mine ? "Mark done" : "Only the assignee can change this"}
          onClick={() => void setStatus(true)}
          className={`flex h-12 flex-1 items-center justify-center rounded-full ${
            !mine
              ? done
                ? "bg-white/10 text-white/35"
                : "text-white/25"
              : done
                ? "bg-[#34c759] text-white shadow-[0_8px_18px_-8px_rgba(52,199,89,0.95)]"
                : "text-white/55"
          }`}
        >
          <Mark kind="tick" />
        </button>
      </div>
    </article>
  );
}
