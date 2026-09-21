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
    <main className="ott-home relative min-h-screen overflow-x-hidden bg-black font-body text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 12% 0%, rgba(37,99,235,0.32), transparent 55%), radial-gradient(ellipse 40% 30% at 90% 0%, rgba(29,78,216,0.18), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_minmax(18rem,22rem)]">
        <div>
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CONTROL ROOM</p>
          <h1 className="mt-3 font-heading text-[clamp(2.4rem,6vw,3.8rem)] leading-none">Studio desk</h1>
          <p className="mt-4 max-w-sm text-sm text-white/70">Sign in to manage stills, films, and social cuts.</p>
          <Link href="/" className="mt-8 inline-block text-sm font-medium text-white/60 underline-offset-4 hover:text-white hover:underline">
            ← Back to site
          </Link>
        </div>

        <form onSubmit={onSubmit} className="relative border border-white/15 bg-black/40 p-6 sm:p-7">
          <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l border-t border-white/45" aria-hidden />
          <span className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r border-t border-white/45" aria-hidden />
          <span className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b border-l border-white/45" aria-hidden />
          <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b border-r border-white/45" aria-hidden />
          <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">SC. 00 · AUTH</p>
          <h2 className="mt-2 font-heading text-3xl leading-none">Sign in</h2>
          <label className="mt-6 block text-xs font-medium text-white/70">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-white/20 bg-white/[0.07] px-4 py-3 text-sm text-white placeholder:text-white/45 caret-white outline-none transition focus:border-white/55"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-5 w-full bg-[#fafafa] px-6 py-3 text-sm font-semibold text-black hover:bg-blue-100 disabled:opacity-40"
          >
            {status === "submitting" ? "Signing in…" : "Sign in"}
          </button>
          {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
