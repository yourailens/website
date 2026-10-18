"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PlannerTask } from "@/data/planner";
import { plannerTaskBoardLabel, plannerTaskBoardTone } from "@/data/planner";
import { PlannerFace } from "@/components/planner/planner-look";
import { P_BTN_GHOST, P_FIELD } from "@/components/planner/planner-ui";

function when(deadline: string | null) {
  if (!deadline) return "No date";
  const d = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
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

const TONE = {
  idle: { bar: "bg-[#ff3b30]", ink: "text-white", ring: "border-[#ff3b30]/45" },
  moving: { bar: "bg-[#6d28d9]", ink: "text-white", ring: "border-[#6d28d9]/55" },
  roadblock: { bar: "bg-[#f5c16c]", ink: "text-[#1a1408]", ring: "border-[#f5c16c]/70" },
  done: { bar: "bg-[#34c759]", ink: "text-white", ring: "border-[#34c759]/45" },
} as const;

export default function TaskCard({ task, mine }: { task: PlannerTask; mine: boolean }) {
  const router = useRouter();
  const [done, setDone] = useState(task.status === "done");
  const [busy, setBusy] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishNote, setFinishNote] = useState("");
  const [finishErr, setFinishErr] = useState("");
  const tone = plannerTaskBoardTone({ ...task, status: done ? "done" : task.status === "done" ? "open" : task.status });
  const paint = TONE[tone];

  useEffect(() => {
    setDone(task.status === "done");
  }, [task.status]);

  const who = task.assignee?.display_name ?? "Unassigned";

  async function reopen() {
    if (!mine || busy || !done) return;
    setDone(false);
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      });
      if (!res.ok) setDone(true);
      else router.refresh();
    } catch {
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    const note = finishNote.trim();
    if (!mine || busy || !note) return;
    setBusy(true);
    setFinishErr("");
    try {
      const res = await fetch(`/api/planner/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done", completion_note: note }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFinishErr(data.error || "Could not finish this.");
        return;
      }
      setDone(true);
      setFinishOpen(false);
      setFinishNote("");
      router.refresh();
    } catch {
      setFinishErr("Could not finish this.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <article className={`flex h-auto w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[28px] border bg-[#121214] sm:h-[340px] ${paint.ring}`}>
      <div className={`shrink-0 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] ${paint.bar} ${paint.ink}`}>
        {plannerTaskBoardLabel(tone)}
      </div>

      {task.milestone ? (
        <Link
          href={`/planner/milestones/${task.milestone.id}`}
          className="mx-5 mt-4 flex w-fit max-w-[calc(100%-2.5rem)] min-w-0 items-center gap-1.5 self-start rounded-full border border-[#f5c16c]/40 bg-[#f5c16c]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f5c16c]"
        >
          <span className="shrink-0" aria-hidden>
            ◆
          </span>
          <span className="min-w-0 truncate">{task.milestone.title}</span>
        </Link>
      ) : null}

      <Link href={`/planner/tasks/${task.id}`} className={`flex min-h-0 min-w-0 flex-1 flex-col px-5 pb-2 ${task.milestone ? "pt-3" : "pt-4"}`}>
        <h3 className="line-clamp-2 shrink-0 break-words text-[20px] font-bold leading-snug tracking-tight text-white">{task.title}</h3>
        <p className={`mt-2 text-[15px] leading-[1.55] ${task.milestone ? "line-clamp-3" : "line-clamp-4"} ${task.notes ? "text-white/80" : "text-white/40"}`}>
          {task.notes || "No notes yet"}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="flex min-w-0 items-center gap-2">
            <PlannerFace name={who} size={28} />
            <span className="truncate text-[14px] font-semibold text-white">{who}</span>
          </span>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium text-white/75">{when(task.deadline)}</span>
        </div>
      </Link>

      <div
        className={`mx-4 mb-4 grid w-auto min-w-0 shrink-0 grid-cols-2 gap-2 rounded-full border p-1.5 ${
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
          onClick={() => void reopen()}
          className={`flex h-12 min-w-0 appearance-none items-center justify-center rounded-full ${
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
          onClick={() => {
            if (!mine || busy || done) return;
            setFinishNote("");
            setFinishErr("");
            setFinishOpen(true);
          }}
          className={`flex h-12 min-w-0 appearance-none items-center justify-center rounded-full ${
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
    {finishOpen ? (
      <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          aria-label="Dismiss"
          className="absolute inset-0 bg-black/65"
          disabled={busy}
          onClick={() => {
            if (!busy) setFinishOpen(false);
          }}
        />
        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-[440px] rounded-[28px] border border-white/20 bg-[#161618] p-5 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.9)] sm:p-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86efac]">Finish</p>
          <h2 className="mt-2 text-[22px] font-bold leading-tight text-white">What got done?</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/55">Write a completion note. The tick will not save without it.</p>
          <textarea
            className={`${P_FIELD} mt-4 min-h-[110px] resize-y`}
            value={finishNote}
            onChange={(e) => setFinishNote(e.target.value)}
            placeholder="Shipped the filing, receipt is in the drive"
            autoFocus
          />
          {finishErr ? <p className="mt-3 text-sm text-rose-300">{finishErr}</p> : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || !finishNote.trim()}
              onClick={() => void finish()}
              className="inline-flex items-center justify-center rounded-md bg-[#34c759] px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
            >
              {busy ? "Saving" : "Mark done"}
            </button>
            <button type="button" disabled={busy} onClick={() => setFinishOpen(false)} className={`${P_BTN_GHOST} !py-2.5`}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
