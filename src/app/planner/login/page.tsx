"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlannerLoginAgent } from "@/data/planner";
import { P_BTN, P_FIELD, P_MENU } from "@/components/planner/planner-ui";

export default function PlannerLoginPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<PlannerLoginAgent[]>([]);
  const [loadErr, setLoadErr] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const nameBox = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => agents.find((a) => a.id === selectedId) ?? null,
    [agents, selectedId]
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.display_name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q)
    );
  }, [agents, query]);

  useEffect(() => {
    void fetch("/api/planner/me")
      .then(async (res) => {
        const j = (await res.json().catch(() => ({}))) as { member?: unknown };
        if (res.ok && j.member) router.replace("/planner/tasks");
      })
      .catch(() => {});

    void fetch("/api/planner/login")
      .then(async (res) => {
        const j = (await res.json().catch(() => ({}))) as {
          agents?: PlannerLoginAgent[];
          error?: string;
        };
        if (!res.ok) {
          setLoadErr(j.error || "Unable to load agents.");
          return;
        }
        setAgents(j.agents ?? []);
        if (!(j.agents ?? []).length) {
          setLoadErr("No agents on file. Run supabase/migrations/097_planner_agents.sql first.");
        }
      })
      .catch(() => setLoadErr("Unable to reach the clearance desk."));
  }, [router]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!nameBox.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  function pickAgent(agent: PlannerLoginAgent) {
    setSelectedId(agent.id);
    setQuery(agent.display_name);
    setOpen(false);
    setErr("");
  }

  function onNameChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (selected && value.trim().toLowerCase() !== selected.display_name.toLowerCase()) {
      setSelectedId(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      setErr("Type your name and pick yourself from the list.");
      setOpen(true);
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/planner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: selectedId, code: code.trim() }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Clearance denied");
      router.replace("/planner/tasks");
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Clearance denied");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-4 py-10 text-white sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(47,108,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(47,108,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="mb-6 border-b border-white/15 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7eb6ff]">
            YAIL // Field access
          </p>
          <h1 className="mt-2 text-[34px] font-bold leading-none tracking-tight sm:text-[42px]">
            Clearance desk
          </h1>
          <p className="mt-2 max-w-md text-[14px] text-white/50">
            Type your name, pick yourself, then enter your code.
          </p>
        </div>

        <Link
          href="/"
          className="mb-6 inline-flex text-[13px] text-white/45 transition hover:text-[#7eb6ff]"
        >
          ← Abort · return to site
        </Link>

        {loadErr ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-200">
            {loadErr}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <section>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                01 · Who are you
              </p>
              <div ref={nameBox} className="relative">
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={P_FIELD}
                  value={query}
                  onChange={(e) => onNameChange(e.target.value)}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
                      setOpen(true);
                      return;
                    }
                    if (!matches.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlight((h) => (h + 1) % matches.length);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlight((h) => (h - 1 + matches.length) % matches.length);
                    } else if (e.key === "Enter" && open) {
                      e.preventDefault();
                      const agent = matches[highlight];
                      if (agent) pickAgent(agent);
                    }
                  }}
                  placeholder="Start typing your name…"
                />
                {open && matches.length ? (
                  <ul className={`absolute z-50 mt-1.5 max-h-64 w-full ${P_MENU}`}>
                    {matches.map((agent, i) => {
                      const on = agent.id === selectedId || i === highlight;
                      const callsign = agent.display_name.slice(0, 2).toUpperCase();
                      return (
                        <li key={agent.id}>
                          <button
                            type="button"
                            className={[
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                              on ? "bg-[#2f6cff] text-white" : "text-white/80 hover:bg-white/10",
                            ].join(" ")}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setHighlight(i)}
                            onClick={() => pickAgent(agent)}
                          >
                            <span
                              className={[
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-bold",
                                on ? "bg-white/20" : "bg-white/10",
                              ].join(" ")}
                            >
                              {callsign}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[15px] font-semibold leading-tight">
                                {agent.display_name}
                              </span>
                              <span
                                className={[
                                  "mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wider",
                                  on ? "text-white/70" : "text-white/35",
                                ].join(" ")}
                              >
                                {agent.role_title || "Agent"}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {open && query.trim() && !matches.length ? (
                  <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-white/20 bg-[#161618] px-4 py-3 text-[13px] text-white/45 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.85)]">
                    No agent matches “{query.trim()}”
                  </div>
                ) : null}
              </div>
              {selected ? (
                <p className="mt-2 text-[12px] text-[#9cc0ff]">
                  Selected · {selected.display_name}
                </p>
              ) : (
                <p className="mt-2 text-[12px] text-white/35">Pick a name from the dropdown.</p>
              )}
            </section>

            <section
              className={[
                "rounded-[24px] border p-4 transition sm:p-5",
                selected
                  ? "border-white/20 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl"
                  : "border-white/10 bg-white/[0.03] opacity-70",
              ].join(" ")}
            >
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                02 · Clearance code
              </p>
              <label className="block">
                <span className="sr-only">Clearance code</span>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{3}"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={!selected}
                  required
                  maxLength={3}
                  minLength={3}
                  className={`${P_FIELD} font-mono tracking-[0.35em]`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder={selected ? "•••" : "Select yourself first"}
                />
              </label>

              {err ? <p className="mt-3 text-sm text-rose-300">{err}</p> : null}

              <button
                type="submit"
                disabled={busy || !selected}
                className={`${P_BTN} mt-4 w-full py-3 tracking-wide`}
              >
                {busy ? "Verifying…" : "Request entry"}
              </button>
            </section>
          </form>
        )}

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/25">
          Unauthorized access is logged · YourAILens field desk
        </p>
      </div>
    </main>
  );
}
