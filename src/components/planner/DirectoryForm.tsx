"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PLANNER_DIRECTORY_KINDS,
  plannerDirectoryKindLabel,
  type PlannerDirectoryItem,
  type PlannerDirectoryKind,
} from "@/data/planner";
import { P_BTN_FANCY, P_PAGE } from "@/components/planner/planner-ui";

const SOFT =
  "w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/30";

export default function DirectoryForm({ initial }: { initial?: PlannerDirectoryItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState({
    title: initial?.title ?? "",
    blurb: initial?.blurb ?? "",
    kind: (initial?.kind ?? "drive") as PlannerDirectoryKind,
    url: initial?.url ?? "",
    label: initial?.label ?? "",
    notes: initial?.notes ?? "",
  });

  async function save() {
    if (!draft.title.trim() || !draft.url.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(initial ? `/api/planner/directory/${initial.id}` : "/api/planner/directory", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Save failed");
      router.push("/planner/directory");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setBusy(false);
    }
  }

  async function remove() {
    if (!initial) return;
    if (!confirm("Delete this link card?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/directory/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Delete failed");
      }
      router.push("/planner/directory");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
      setBusy(false);
    }
  }

  return (
    <div className={P_PAGE}>
      <Link href="/planner/directory" className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white">
        Back
      </Link>
      <section className="rounded-[36px] border border-white/20 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {initial ? "Edit link" : "New link"}
        </p>
        <input
          className="mt-3 w-full bg-transparent text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-tight text-white outline-none placeholder:text-white/25"
          placeholder="What is this"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <input
          className="mt-2 w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/30"
          placeholder="Short note"
          value={draft.blurb}
          onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
        />

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Kind</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLANNER_DIRECTORY_KINDS.map((kind) => {
            const on = draft.kind === kind;
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={on}
                onClick={() => setDraft({ ...draft, kind })}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${on ? "bg-white text-[#111]" : "bg-white/10 text-white/70"}`}
              >
                {plannerDirectoryKindLabel(kind)}
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Link</p>
        <input
          className={`${SOFT} mt-3`}
          placeholder="https://"
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
        />
        <input
          className={`${SOFT} mt-3`}
          placeholder="Button label, optional"
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
        <textarea
          className={`${SOFT} mt-3 min-h-28 resize-none leading-[1.5]`}
          placeholder="Notes for the team"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />

        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={busy || !draft.title.trim() || !draft.url.trim()}
            onClick={() => void save()}
            className={`${P_BTN_FANCY} px-5 py-2.5`}
          >
            {busy ? "Saving" : initial ? "Save card" : "Add card"}
          </button>
          <button type="button" className="text-[14px] text-white/50" onClick={() => router.push("/planner/directory")}>
            Cancel
          </button>
          {initial ? (
            <button type="button" disabled={busy} onClick={() => void remove()} className="ml-auto text-[14px] text-[#ffb4b4]">
              Delete
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
