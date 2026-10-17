"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { P_BTN, P_FIELD, P_LABEL } from "@/components/planner/planner-ui";

export default function PlannerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    void fetch("/api/planner/me")
      .then(async (res) => {
        const j = (await res.json().catch(() => ({}))) as {
          member?: unknown;
          needsBootstrap?: boolean;
        };
        if (res.ok && j.member) {
          router.replace("/planner");
          return;
        }
        if (j.needsBootstrap) setMode("bootstrap");
      })
      .catch(() => {});
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/planner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "bootstrap"
            ? { mode: "bootstrap", email, password, display_name: displayName || "CEO", role_title: "CEO" }
            : { email, password }
        ),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Sign-in failed");
      router.replace("/planner");
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-5 text-white">
      <div className="w-full max-w-[420px]">
        <p className="text-[15px] text-[#71767b]">Studio planner</p>
        <h1 className="mt-2 text-[40px] font-bold leading-tight tracking-tight">Sign in</h1>
        <p className="mt-2 text-[15px] text-[#71767b]">Tasks, follow ups, and the team feed.</p>
        <Link href="/" className="mt-4 inline-block text-[15px] text-[#1d9bf0] hover:underline">
          Back to site
        </Link>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <p className="text-[15px] font-bold">
            {mode === "bootstrap" ? "Create the first login" : "Welcome back"}
          </p>
          <p className="mt-2 text-sm text-white/50">
            {mode === "bootstrap"
              ? "First run. Create your CEO login, then invite the team."
              : "Each person has their own email and password."}
          </p>

          {mode === "bootstrap" ? (
            <label className={`${P_LABEL} mt-6`}>
              Display name
              <input
                className={`${P_FIELD} mt-2`}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          ) : null}

          <label className={`${P_LABEL} mt-4`}>
            Email
            <input
              type="email"
              required
              className={`${P_FIELD} mt-2`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourailens.studio"
              autoComplete="username"
            />
          </label>
          <label className={`${P_LABEL} mt-4`}>
            Password
            <input
              type="password"
              required
              minLength={6}
              className={`${P_FIELD} mt-2`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "bootstrap" ? "new-password" : "current-password"}
            />
          </label>

          {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}

          <button type="submit" disabled={busy} className={`${P_BTN} mt-2 w-full py-2.5`}>
            {busy ? "…" : mode === "bootstrap" ? "Create planner" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
