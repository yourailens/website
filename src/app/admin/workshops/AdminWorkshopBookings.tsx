"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ADMIN_BTN,
  ADMIN_BUBBLE_PAD,
  ADMIN_KICKER,
  ADMIN_PAGE,
  ADMIN_ROW,
} from "@/components/admin/admin-ui";

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
      return "bg-emerald-400/15 text-emerald-200";
    case "pending_verification":
      return "bg-amber-400/15 text-amber-200";
    case "pending_payment":
      return "bg-white/10 text-white/70";
    case "cancelled":
      return "bg-rose-400/15 text-rose-200";
    default:
      return "bg-white/10 text-white/60";
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
      <div className="py-16 text-center">
        <h2 className="font-heading text-2xl leading-none">Not authorized</h2>
        <p className="mt-3 text-sm text-white/50">Sign in to manage workshop bookings.</p>
        <Link href="/admin/login" className={`mt-6 inline-flex ${ADMIN_BTN}`}>
          Admin login
        </Link>
      </div>
    );
  }

  if (sessionOk === null || loading) {
    return <div className="py-16 text-center text-sm text-white/45">Loading…</div>;
  }

  return (
    <div className={ADMIN_PAGE}>
      <div>
        <p className={ADMIN_KICKER}>Studio</p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
          Verify UPI payments and send confirmation emails.
        </p>
      </div>

      {loadErr ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {loadErr}
        </div>
      ) : null}
      {actionMsg ? (
        <div className={`${ADMIN_ROW} text-sm text-emerald-200`}>{actionMsg}</div>
      ) : null}

      <div className={`${ADMIN_BUBBLE_PAD} overflow-x-auto !p-0`}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              <th className="px-4 py-3.5">Name / email</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">UPI phone</th>
              <th className="px-4 py-3.5">Screenshot</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="w-40 px-4 py-3.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                  No registrations yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-white/8 align-top last:border-0">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="mt-0.5 break-all text-xs text-white/45">{r.email}</p>
                    <p className="mt-1 font-mono text-[10px] text-white/25">{r.id}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle(r.status)}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                    {r.payment_verified_at ? (
                      <p className="mt-1 text-[10px] text-white/35">
                        Verified {new Date(r.payment_verified_at).toLocaleString()}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-white/70">{r.payment_phone ?? "—"}</td>
                  <td className="px-4 py-3.5">
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
                          className="h-20 w-full rounded-xl border border-white/10 object-cover"
                        />
                        <span className="mt-1 block text-xs font-semibold text-emerald-300/80 hover:underline">
                          Open full size
                        </span>
                      </a>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-white/45">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.status === "pending_verification" ? (
                      <button
                        type="button"
                        disabled={approvingId === r.id}
                        onClick={() => approve(r.id)}
                        className={`${ADMIN_BTN} w-full !px-3 !py-2 text-xs`}
                      >
                        {approvingId === r.id ? "…" : "Approve & email"}
                      </button>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
