"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  email: string;
  status: string;
  payment_phone: string | null;
  payment_screenshot_url: string | null;
  payment_verified_at: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
};

function statusStyle(status: string): string {
  switch (status) {
    case "registered":
      return "bg-emerald-100 text-emerald-900";
    case "pending_verification":
      return "bg-amber-100 text-amber-950";
    case "pending_payment":
      return "bg-slate-200 text-slate-800";
    case "cancelled":
      return "bg-red-100 text-red-900";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export default function AdminWorkshopBookings() {
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadErr(null);
    const res = await fetch("/api/admin/workshop-registrations", { cache: "no-store" });
    const j = (await res.json().catch(() => ({}))) as { registrations?: Row[]; error?: string };
    if (!res.ok) {
      setLoadErr(j.error || "Could not load registrations");
      setRows([]);
      return;
    }
    setRows(Array.isArray(j.registrations) ? j.registrations : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/session", { method: "GET" });
      if (cancelled) return;
      setSessionOk(res.ok);
      if (res.ok) {
        setLoading(true);
        await load();
        if (!cancelled) setLoading(false);
      } else {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function approve(id: string) {
    setActionMsg(null);
    setApprovingId(id);
    try {
      const res = await fetch("/api/admin/workshop-registrations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        emailStatus?: string;
        emailReason?: string;
      };
      if (!res.ok) {
        setActionMsg(j.error || "Approve failed");
        return;
      }
      if (j.emailStatus === "sent") {
        setActionMsg("Approved and confirmation email sent.");
      } else if (j.emailStatus === "skipped") {
        setActionMsg(`Approved. Email skipped: ${j.emailReason ?? "check env"}`);
      } else {
        setActionMsg(`Approved. Confirmation email failed: ${j.emailReason ?? "unknown"}`);
      }
      await load();
    } finally {
      setApprovingId(null);
    }
  }

  if (sessionOk === false) {
    return (
      <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-heading text-2xl font-bold">Not authorized</h1>
          <p className="mt-3 text-sm text-slate-600">Sign in to manage workshop bookings.</p>
          <Link href="/admin/login" className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
            Admin login
          </Link>
        </div>
      </main>
    );
  }

  if (sessionOk === null || loading) {
    return (
      <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-lg text-center text-sm text-slate-600">Loading…</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f6f2ea] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">Admin</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">Workshop bookings</h1>
            <p className="mt-1 text-sm text-slate-600">Verify UPI payments and send confirmation emails.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800"
            >
              Gallery admin
            </Link>
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
              View site
            </Link>
            <button type="button" onClick={signOut} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Sign out
            </button>
          </div>
        </header>

        {loadErr ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{loadErr}</div>
        ) : null}
        {actionMsg ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{actionMsg}</div>
        ) : null}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Name / email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">UPI phone</th>
                <th className="px-4 py-3">Screenshot</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 w-40">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No registrations yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <p className="mt-0.5 break-all text-xs text-slate-600">{r.email}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">{r.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyle(r.status)}`}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                      {r.payment_verified_at ? (
                        <p className="mt-1 text-[10px] text-slate-500">Verified {new Date(r.payment_verified_at).toLocaleString()}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-800">{r.payment_phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.payment_screenshot_url ? (
                        <a
                          href={r.payment_screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block max-w-[140px]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.payment_screenshot_url}
                            alt="Payment proof"
                            className="h-20 w-full rounded-lg border border-slate-200 object-cover"
                          />
                          <span className="mt-1 block text-xs font-semibold text-blue-600 hover:underline">Open full size</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "pending_verification" ? (
                        <button
                          type="button"
                          disabled={approvingId === r.id}
                          onClick={() => approve(r.id)}
                          className="w-full rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {approvingId === r.id ? "…" : "Approve & email"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
