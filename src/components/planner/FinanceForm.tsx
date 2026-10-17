"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PLANNER_FINANCE_KINDS,
  PLANNER_PAYMENT_METHODS,
  plannerFinanceKindLabel,
  plannerPaymentMethodLabel,
  type PlannerFinanceEntry,
  type PlannerFinanceKind,
  type PlannerPaymentMethod,
} from "@/data/planner";
import PlannerConfirm from "@/components/planner/PlannerConfirm";
import { P_BTN_FANCY, P_PAGE } from "@/components/planner/planner-ui";

const SOFT =
  "w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/30";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function FinanceForm({ initial }: { initial?: PlannerFinanceEntry }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState({
    kind: (initial?.kind ?? "expense") as PlannerFinanceKind,
    title: initial?.title ?? "",
    party: initial?.party ?? "",
    amount: initial ? String(initial.amount) : "",
    payment_method: (initial?.payment_method ?? "upi") as PlannerPaymentMethod,
    notes: initial?.notes ?? "",
    paid_at: toLocalInput(initial?.paid_at ?? new Date().toISOString()),
  });

  async function save() {
    if (!draft.title.trim() || !draft.party.trim()) return;
    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErr("Amount must be more than zero");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const body = {
        kind: draft.kind,
        title: draft.title,
        party: draft.party,
        amount,
        payment_method: draft.payment_method,
        notes: draft.notes,
        paid_at: fromLocalInput(draft.paid_at),
      };
      const res = await fetch(initial ? `/api/planner/finances/${initial.id}` : "/api/planner/finances", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Save failed");
      router.push("/planner/finances");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setBusy(false);
    }
  }

  async function remove() {
    if (!initial) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/finances/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Delete failed");
      }
      router.push("/planner/finances");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
      setBusy(false);
      setAskDelete(false);
    }
  }

  const partyLabel = draft.kind === "expense" ? "Who paid" : "Who paid us";
  const whatLabel = draft.kind === "expense" ? "What was it for" : "What was it for";

  return (
    <div className={P_PAGE}>
      <Link href="/planner/finances" className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white">
        Back
      </Link>
      <section className="rounded-[36px] border border-white/20 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {initial ? "Edit entry" : "New entry"}
        </p>
        <h2 className="mt-2 text-[clamp(2rem,4vw,3rem)] font-bold leading-none">Money in or out</h2>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Type</p>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5">
          {PLANNER_FINANCE_KINDS.map((kind) => {
            const on = draft.kind === kind;
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={on}
                onClick={() => setDraft({ ...draft, kind })}
                className={`min-h-12 rounded-[16px] text-[14px] font-semibold ${
                  on
                    ? kind === "revenue"
                      ? "bg-[#34c759] text-white"
                      : "bg-[#e50914] text-white"
                    : "text-white/70"
                }`}
              >
                {plannerFinanceKindLabel(kind)}
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">{whatLabel}</p>
        <input
          className={`${SOFT} mt-3`}
          placeholder="Shoot day lunch, client invoice, tools"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">{partyLabel}</p>
        <input
          className={`${SOFT} mt-3`}
          placeholder={draft.kind === "expense" ? "Your name or the team member" : "Client or company"}
          value={draft.party}
          onChange={(e) => setDraft({ ...draft, party: e.target.value })}
        />

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">How much</p>
        <input
          className={`${SOFT} mt-3`}
          inputMode="decimal"
          placeholder="0"
          value={draft.amount}
          onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
        />

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Payment method</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLANNER_PAYMENT_METHODS.map((method) => {
            const on = draft.payment_method === method;
            return (
              <button
                key={method}
                type="button"
                aria-pressed={on}
                onClick={() => setDraft({ ...draft, payment_method: method })}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${on ? "bg-white text-[#111]" : "bg-white/10 text-white/70"}`}
              >
                {plannerPaymentMethodLabel(method)}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">When</p>
        <p className="mt-1 text-[13px] text-white/40">Filled automatically. Change it if you need to.</p>
        <input
          type="datetime-local"
          className={`${SOFT} mt-3 [color-scheme:dark]`}
          value={draft.paid_at}
          onChange={(e) => setDraft({ ...draft, paid_at: e.target.value })}
        />

        <textarea
          className={`${SOFT} mt-6 min-h-28 resize-none leading-[1.5]`}
          placeholder="Notes, optional"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />

        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={busy || !draft.title.trim() || !draft.party.trim() || !draft.amount.trim()}
            onClick={() => void save()}
            className={`${P_BTN_FANCY} px-5 py-2.5`}
          >
            {busy ? "Saving" : initial ? "Save entry" : "Add entry"}
          </button>
          <button type="button" className="text-[14px] text-white/50" onClick={() => router.push("/planner/finances")}>
            Cancel
          </button>
          {initial ? (
            <button type="button" disabled={busy} onClick={() => setAskDelete(true)} className="ml-auto text-[14px] text-[#ffb4b4]">
              Delete
            </button>
          ) : null}
        </div>
      </section>

      <PlannerConfirm
        open={askDelete}
        title="Delete this entry?"
        body="This removes the finance row from the ledger. You cannot undo it."
        confirmLabel="Delete entry"
        busy={busy}
        onCancel={() => setAskDelete(false)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
