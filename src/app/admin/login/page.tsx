"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(j.error || "Sign-in failed.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Something went wrong.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">Admin</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Enter the admin password to manage gallery uploads.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-xs font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-slate-900/10 focus:ring-2"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {status === "submitting" ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}
        <Link href="/" className="mt-8 inline-block text-sm font-medium text-slate-600 underline-offset-4 hover:underline">
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
