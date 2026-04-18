"use client";

import { useState } from "react";
import {
  WORKSHOP_EVENT_SLUG,
  WORKSHOP_LIST_PRICE_INR,
  WORKSHOP_PRICE_INR,
  formatInr,
  workshopDiscountPercentOff,
  workshopEarlyBirdDeadlineLabel,
} from "@/lib/events/workshop-config";

export default function WorkshopRegisterForm({
  soldOut,
  earlyBirdActive,
  seatsLeft,
  upiId,
  upiPayeeName,
}: {
  soldOut: boolean;
  earlyBirdActive: boolean;
  seatsLeft: number;
  upiId: string;
  upiPayeeName: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [paymentPhone, setPaymentPhone] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [infoNote, setInfoNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pct = workshopDiscountPercentOff();
  const showEarlyBird = earlyBirdActive && !soldOut;
  const amountToPay = showEarlyBird ? WORKSHOP_PRICE_INR : WORKSHOP_LIST_PRICE_INR;
  const amountLabel = formatInr(amountToPay);

  async function onStep1(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: WORKSHOP_EVENT_SLUG,
          name,
          email,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        registrationId?: string;
        resumePayment?: boolean;
        ok?: boolean;
      };
      if (!res.ok) {
        setErr(j.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      if (j.registrationId) {
        setRegistrationId(j.registrationId);
        setStep(2);
      }
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!registrationId || !screenshot) {
      setErr("Choose a screenshot file.");
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("registrationId", registrationId);
      fd.set("email", email.trim().toLowerCase());
      fd.set("paymentPhone", paymentPhone.trim());
      fd.set("screenshot", screenshot);

      const res = await fetch("/api/events/register/payment", {
        method: "POST",
        body: fd,
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; note?: string; ok?: boolean };
      if (!res.ok) {
        setErr(j.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      setDone(true);
      setInfoNote(j.note ?? null);
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function goBackToStep1() {
    setStep(1);
    setErr(null);
    setScreenshot(null);
    setPaymentPhone("");
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-8 text-center shadow-inner shadow-blue-100">
        <p className="font-heading text-xl font-bold text-slate-900">Payment proof received</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-800">
          We’re verifying your payment. You’ll get an email shortly—this holds your spot while we confirm. After verification, we’ll send your
          full confirmation with workshop details.
        </p>
        {infoNote ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{infoNote}</p> : null}
      </div>
    );
  }

  if (soldOut) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="font-heading text-lg font-bold text-slate-900">All 20 seats are reserved.</p>
        <p className="mt-2 text-sm text-slate-600">
          Follow{" "}
          <a href="https://instagram.com/yourailens" className="font-semibold text-blue-600 hover:underline" target="_blank" rel="noreferrer">
            @yourailens
          </a>{" "}
          for the next cohort, or reply to any YourAILens email and we’ll add you to the waitlist.
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <form onSubmit={onStep2} className="space-y-4">
        <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4 text-center shadow-sm sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Step 2 of 2 · Pay</p>
          <p className="mt-2 text-sm text-slate-600">
            Pay <strong className="text-slate-900">{amountLabel}</strong>
            {showEarlyBird ? (
              <span className="text-slate-500"> (early bird)</span>
            ) : (
              <span className="text-slate-500"> (standard)</span>
            )}
          </p>
        </div>

        {upiId ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 sm:px-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">Payee name</p>
            <p className="mt-1 text-base font-bold text-slate-900">{upiPayeeName}</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-emerald-800">UPI ID</p>
            <p className="mt-2 break-all font-mono text-lg font-black tracking-tight text-slate-900">{upiId}</p>
            <p className="mt-2 text-xs text-emerald-900/80">Use any UPI app. Use this exact amount: {amountLabel}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            UPI ID is not configured yet. Please contact us on Instagram @yourailens or email to complete payment.
          </div>
        )}

        <label className="block text-left">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Phone number used for this UPI payment *</span>
          <input
            required
            value={paymentPhone}
            onChange={(e) => setPaymentPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Same number as in your UPI app"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>

        <label className="block text-left">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Payment screenshot *</span>
          <input
            required
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
          />
          <span className="mt-1 block text-[11px] text-slate-500">PNG, JPG, or WebP · max 5 MB</span>
        </label>

        {err ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={goBackToStep1}
            className="order-2 w-full rounded-full border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:order-1 sm:w-auto sm:px-8"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="order-1 w-full rounded-full bg-blue-600 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:flex-1"
          >
            {submitting ? "Submitting…" : "Submit payment proof"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onStep1} className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4 text-center shadow-sm sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Step 1 of 2 · Your details</p>
        {showEarlyBird ? (
          <>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">{pct}% off early bird</p>
            <p className="mt-1 font-heading text-2xl font-black text-slate-900">
              <span className="text-lg font-semibold text-slate-400 line-through decoration-slate-300">
                {formatInr(WORKSHOP_LIST_PRICE_INR)}
              </span>{" "}
              <span className="text-emerald-600">{formatInr(WORKSHOP_PRICE_INR)}</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Ends {workshopEarlyBirdDeadlineLabel()} · {seatsLeft} seats left</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Standard rate</p>
            <p className="mt-1 font-heading text-2xl font-black text-slate-900">{formatInr(WORKSHOP_LIST_PRICE_INR)}</p>
            <p className="mt-1 text-[11px] text-slate-500">per seat · {seatsLeft} left</p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-left">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Full name *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Your name"
          />
        </label>
        <label className="block text-left">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Email *</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="you@email.com"
          />
        </label>
      </div>
      {err ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-blue-600 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Continuing…" : "Continue to payment"}
      </button>
      <p className="text-center text-[11px] text-slate-500">
        By registering you agree to hear from us about this event. We never sell your data.
      </p>
    </form>
  );
}
