"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SITE_CONTACT_EMAIL, SITE_LOCATION_LINE } from "@/lib/site-contact";

type Slot = {
  iso: string;
  dayLabel: string;
  timeLabel: string;
};

type BookingResponse = {
  ok?: boolean;
  error?: string;
  note?: string;
  meetUrl?: string;
  meetError?: string;
  timezone?: string;
};

type StepId = "when" | "details";

const STEPS: { id: StepId; n: string; label: string }[] = [
  { id: "when", n: "01", label: "When" },
  { id: "details", n: "02", label: "You" },
];

const FIELD =
  "contact-glass-field mt-1.5 w-full border border-white/20 bg-white/[0.07] px-3.5 py-2.5 text-[15px] text-white placeholder:text-white/55 caret-white outline-none backdrop-blur-md transition focus:border-white/50 focus:bg-white/[0.12]";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ymdInZone(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(iso));
  const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: pick("year"), month: pick("month"), day: pick("day") };
}

function dateKey(iso: string, timeZone: string) {
  const { year, month, day } = ymdInZone(iso, timeZone);
  return `${year}-${pad(month)}-${pad(day)}`;
}

function mondayIndex(year: number, month: number, day: number) {
  const js = new Date(year, month - 1, day).getDay();
  return (js + 6) % 7;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function timezoneNice(tz: string) {
  try {
    const name = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value;
    return name ? `${name} · ${tz.replaceAll("_", " ")}` : tz.replaceAll("_", " ");
  } catch {
    return tz.replaceAll("_", " ");
  }
}

export default function ContactExperience() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [step, setStep] = useState<StepId>("when");
  const [monthCursor, setMonthCursor] = useState<{ year: number; month: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<BookingResponse | null>(null);

  const selected = useMemo(() => slots.find((s) => s.iso === selectedSlot) ?? null, [slots, selectedSlot]);
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    for (const slot of slots) {
      const list = groups.get(slot.dayLabel);
      if (list) list.push(slot);
      else groups.set(slot.dayLabel, [slot]);
    }
    return groups;
  }, [slots]);

  const availableKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const slot of slots) keys.add(dateKey(slot.iso, timezone));
    return keys;
  }, [slots, timezone]);

  const keyToDayLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const slot of slots) {
      const key = dateKey(slot.iso, timezone);
      if (!map.has(key)) map.set(key, slot.dayLabel);
    }
    return map;
  }, [slots, timezone]);

  const slotsForDay = selectedDay ? groupedByDay.get(selectedDay) ?? [] : [];

  const monthBounds = useMemo(() => {
    if (slots.length === 0) return null;
    const first = ymdInZone(slots[0].iso, timezone);
    const last = ymdInZone(slots[slots.length - 1].iso, timezone);
    return { first, last };
  }, [slots, timezone]);

  const calendarCells = useMemo(() => {
    if (!monthCursor) return [];
    const { year, month } = monthCursor;
    const total = daysInMonth(year, month);
    const padStart = mondayIndex(year, month, 1);
    const cells: Array<{ key: string; day: number | null; available: boolean; dayLabel: string | null }> = [];
    for (let i = 0; i < padStart; i += 1) cells.push({ key: `pad-${i}`, day: null, available: false, dayLabel: null });
    for (let d = 1; d <= total; d += 1) {
      const key = `${year}-${pad(month)}-${pad(d)}`;
      cells.push({
        key,
        day: d,
        available: availableKeys.has(key),
        dayLabel: keyToDayLabel.get(key) ?? null,
      });
    }
    return cells;
  }, [monthCursor, availableKeys, keyToDayLabel]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      const res = await fetch("/api/bookings/slots", { cache: "no-store" });
      const j = (await res.json().catch(() => ({}))) as { slots?: Slot[]; timezone?: string; error?: string };
      if (cancelled) return;
      if (res.ok && Array.isArray(j.slots)) {
        const tz = j.timezone || "Asia/Kolkata";
        setSlots(j.slots);
        setTimezone(tz);
        const first = j.slots[0];
        if (first) {
          setSelectedDay(first.dayLabel);
          const ymd = ymdInZone(first.iso, tz);
          setMonthCursor({ year: ymd.year, month: ymd.month });
        }
      } else {
        setSubmitErr(j.error || "Could not load available slots");
      }
      setLoadingSlots(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function goToMonth(delta: number) {
    if (!monthCursor || !monthBounds) return;
    const date = new Date(monthCursor.year, monthCursor.month - 1 + delta, 1);
    const next = { year: date.getFullYear(), month: date.getMonth() + 1 };
    const min = monthBounds.first.year * 12 + monthBounds.first.month;
    const max = monthBounds.last.year * 12 + monthBounds.last.month;
    const val = next.year * 12 + next.month;
    if (val < min || val > max) return;
    setMonthCursor(next);
  }

  function pickDay(dayLabel: string) {
    setSelectedDay(dayLabel);
    setSelectedSlot(null);
  }

  function goBack() {
    if (step === "details") setStep("when");
    setSubmitErr(null);
  }

  function goNext() {
    if (step !== "when") return;
    if (!selectedSlot) {
      setSubmitErr("Pick a day and a time first.");
      return;
    }
    setSubmitErr(null);
    setStep("details");
  }

  function jumpTo(id: StepId) {
    const target = STEPS.findIndex((s) => s.id === id);
    if (target < 0 || target > stepIndex) return;
    setStep(id);
    setSubmitErr(null);
  }

  async function bookCall(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setSubmitErr("Please pick a time first.");
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      brand: brand.trim(),
      projectSummary: projectSummary.trim(),
      scheduledAt: selectedSlot,
    };
    const res = await fetch("/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = (await res.json().catch(() => ({}))) as BookingResponse;
    setSubmitting(false);
    if (!res.ok && res.status !== 202) {
      setSubmitErr(j.error || "Could not complete booking");
      return;
    }
    setSuccess(j);
  }

  const canPrevMonth =
    monthCursor && monthBounds
      ? monthCursor.year * 12 + monthCursor.month > monthBounds.first.year * 12 + monthBounds.first.month
      : false;
  const canNextMonth =
    monthCursor && monthBounds
      ? monthCursor.year * 12 + monthCursor.month < monthBounds.last.year * 12 + monthBounds.last.month
      : false;

  const canContinue = step === "when" && Boolean(selectedSlot);

  const stepCopy =
    step === "when"
      ? { title: "When should we talk?", hint: "Pick a day, then a time. Grey days are closed." }
      : { title: "Who should we reach?", hint: "We’ll send the Google Meet link to this email." };

  return (
    <div className="ott-home relative min-h-screen overflow-x-hidden bg-black font-body text-white">
      <Navbar />
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 12% 0%, rgba(37,99,235,0.38), transparent 55%), radial-gradient(ellipse 50% 35% at 92% 8%, rgba(29,78,216,0.22), transparent 50%)",
        }}
        aria-hidden
      />

      <main className="relative mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CONTACT</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="max-w-[11ch] font-heading text-[clamp(2rem,5vw,3.4rem)] leading-[0.88]">
              {success ? "You’re booked." : "Book a 15-minute call"}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/85">
              {success
                ? selected
                  ? `${selected.dayLabel} · ${selected.timeLabel} · Google Meet`
                  : "Your slot is confirmed."
                : `Free intro on Google Meet · 15 min · ${SITE_LOCATION_LINE}`}
            </p>
          </div>
          <a
            href={`mailto:${SITE_CONTACT_EMAIL}`}
            className="text-sm font-semibold text-blue-200 underline decoration-blue-400 underline-offset-4 hover:text-white"
          >
            {SITE_CONTACT_EMAIL}
          </a>
        </div>

        {success ? (
          <section className="relative mt-8 overflow-hidden border border-white/15 bg-black/50 p-6 sm:p-10">
            <span className="pointer-events-none absolute right-6 top-4 font-heading text-[7rem] leading-none text-white/5" aria-hidden>
              OK
            </span>
            <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">CONFIRMED</p>
            <p className="mt-4 font-heading text-4xl leading-none">See you then</p>
            {selected ? (
              <p className="mt-3 text-lg text-white">{selected.timeLabel} · {selected.dayLabel}</p>
            ) : null}
            {success.meetUrl ? (
              <a
                href={success.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100"
              >
                Open Google Meet
              </a>
            ) : null}
            {success.note ? <p className="mt-4 text-sm text-white/80">{success.note}</p> : null}
            {success.meetError ? <p className="mt-2 text-sm text-amber-200">{success.meetError}</p> : null}
            <Link href="/" className="mt-8 inline-flex border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:border-white">
              Back home
            </Link>
          </section>
        ) : (
          <section className="relative mt-8 border border-white/15 bg-black/40">
            <span
              className="pointer-events-none absolute right-4 top-2 font-heading text-[clamp(5rem,16vw,9rem)] leading-none text-white/[0.06]"
              aria-hidden
            >
              {STEPS[stepIndex]?.n}
            </span>

            <ol className="grid grid-cols-2 border-b border-white/10">
              {STEPS.map((item, i) => {
                const done = i < stepIndex;
                const on = i === stepIndex;
                const clickable = i < stepIndex;
                return (
                  <li key={item.id} className="relative">
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => jumpTo(item.id)}
                      aria-current={on ? "step" : undefined}
                      className={`flex w-full items-baseline gap-2 px-4 py-4 text-left sm:px-6 ${
                        clickable ? "hover:bg-white/5" : ""
                      }`}
                    >
                      <span className={`font-heading text-xl leading-none ${on ? "text-blue-400" : done ? "text-white" : "text-white/30"}`}>
                        {item.n}
                      </span>
                      <span className={`text-sm ${on ? "text-white" : done ? "text-white/80" : "text-white/35"}`}>
                        {item.label}
                      </span>
                    </button>
                    <span
                      className={`absolute inset-x-0 bottom-0 h-0.5 ${on ? "bg-blue-500" : done ? "bg-white/40" : "bg-transparent"}`}
                      aria-hidden
                    />
                  </li>
                );
              })}
            </ol>

            {selected ? (
              <p className="border-b border-white/10 px-4 py-3 text-sm text-blue-100 sm:px-6">
                {selected.dayLabel} · {selected.timeLabel}
              </p>
            ) : null}

            <div className="relative px-4 py-6 sm:px-8 sm:py-8">
              <h2 className="font-heading text-3xl leading-none">{stepCopy.title}</h2>
              <p className="mt-2 text-sm text-white/80">{stepCopy.hint}</p>

              {loadingSlots ? (
                <p className="mt-8 text-sm text-white">Loading times…</p>
              ) : slots.length === 0 ? (
                <p className="mt-8 text-sm text-white">
                  No slots right now. Email{" "}
                  <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="text-blue-300 underline">
                    {SITE_CONTACT_EMAIL}
                  </a>
                  .
                </p>
              ) : step === "when" ? (
                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-heading text-2xl leading-none">
                        {monthCursor ? monthLabel(monthCursor.year, monthCursor.month) : "Month"}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="Previous month"
                          disabled={!canPrevMonth}
                          onClick={() => goToMonth(-1)}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white hover:border-white disabled:opacity-30"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          aria-label="Next month"
                          disabled={!canNextMonth}
                          onClick={() => goToMonth(1)}
                          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white hover:border-white disabled:opacity-30"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                      {WEEKDAYS.map((d) => (
                        <p key={d} className="py-2 font-mono text-[9px] tracking-[0.16em] text-blue-200">
                          {d}
                        </p>
                      ))}
                      {calendarCells.map((cell) => {
                        if (cell.day == null) return <div key={cell.key} />;
                        const on = cell.dayLabel === selectedDay;
                        if (!cell.available) {
                          return (
                            <span key={cell.key} className="flex h-11 items-center justify-center text-sm text-white/25">
                              {cell.day}
                            </span>
                          );
                        }
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            onClick={() => cell.dayLabel && pickDay(cell.dayLabel)}
                            className={`flex h-11 items-center justify-center text-sm font-semibold transition ${
                              on ? "bg-blue-600 text-white" : "border border-white/15 text-white hover:border-blue-400 hover:bg-blue-600/30"
                            }`}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="font-heading text-xl leading-none">{selectedDay ?? "Pick a day"}</p>
                    <p className="mt-1 text-xs text-blue-100">{timezoneNice(timezone)}</p>
                    <div className="mt-4 grid max-h-[22rem] grid-cols-1 gap-2 overflow-y-auto pr-1">
                      {slotsForDay.map((slot) => {
                        const on = selectedSlot === slot.iso;
                        return (
                          <button
                            key={slot.iso}
                            type="button"
                            onClick={() => setSelectedSlot(slot.iso)}
                            className={`px-3 py-3 text-center text-sm font-semibold transition ${
                              on
                                ? "bg-blue-600 text-white"
                                : "border border-white/20 text-white hover:border-blue-400 hover:bg-blue-600/25"
                            }`}
                          >
                            {slot.timeLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <form id="contact-details" onSubmit={bookCall} className="mt-8 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-1">
                    <span className="text-sm font-semibold text-white">Name *</span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={FIELD}
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="text-sm font-semibold text-white">Email *</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={FIELD}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-white">Brand</span>
                    <input type="text" autoComplete="organization" value={brand} onChange={(e) => setBrand(e.target.value)} className={FIELD} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-white">What should we know before the call? *</span>
                    <textarea
                      rows={4}
                      required
                      value={projectSummary}
                      onChange={(e) => setProjectSummary(e.target.value)}
                      className={`${FIELD} resize-none`}
                    />
                  </label>
                </form>
              )}

              {submitErr ? (
                <p className="mt-5 border border-red-400 bg-red-600/40 px-3 py-2 text-sm text-white">{submitErr}</p>
              ) : null}
            </div>

            {!loadingSlots && slots.length > 0 ? (
              <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur-md sm:px-6">
                {step === "when" ? (
                  <span className="text-sm text-white/50">{timezoneNice(timezone)}</span>
                ) : (
                  <button type="button" onClick={goBack} className="border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:border-white">
                    Back
                  </button>
                )}
                {step === "details" ? (
                  <button
                    type="submit"
                    form="contact-details"
                    disabled={submitting}
                    className="bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100 disabled:opacity-40"
                  >
                    {submitting ? "Booking…" : "Book this call"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                    className="bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100 disabled:opacity-40"
                  >
                    Continue
                  </button>
                )}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
