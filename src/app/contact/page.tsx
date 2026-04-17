"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

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

function dayCardParts(label: string): { day: string; num: string; month: string } {
  const [left, right = ""] = label.split(",");
  const day = left.trim().slice(0, 3).toUpperCase();
  const numMatch = right.match(/\d{1,2}/);
  const monthMatch = right.match(/[A-Za-z]{3}/);
  return { day: day || "DAY", num: numMatch?.[0] ?? "--", month: monthMatch?.[0]?.toUpperCase() ?? "---" };
}

function slotPeriod(timeLabel: string): "Morning" | "Afternoon" | "Evening" {
  const m = timeLabel.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (!m) return "Afternoon";
  let hour = Number(m[1]);
  const meridiem = m[3].toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<BookingResponse | null>(null);
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const selectedSlotDisplay = useMemo(() => {
    const slot = slots.find((s) => s.iso === selectedSlot);
    if (!slot) return null;
    return `${slot.dayLabel} · ${slot.timeLabel}`;
  }, [slots, selectedSlot]);

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    for (const slot of slots) {
      const list = groups.get(slot.dayLabel);
      if (list) {
        list.push(slot);
      } else {
        groups.set(slot.dayLabel, [slot]);
      }
    }
    return groups;
  }, [slots]);

  const dayLabels = useMemo(() => Array.from(groupedByDay.keys()), [groupedByDay]);
  const slotsForDay = selectedDay ? groupedByDay.get(selectedDay) ?? [] : [];
  const slotsByPeriod = useMemo(() => {
    const grouped: Record<"Morning" | "Afternoon" | "Evening", Slot[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };
    for (const slot of slotsForDay) {
      grouped[slotPeriod(slot.timeLabel)].push(slot);
    }
    return grouped;
  }, [slotsForDay]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      const res = await fetch("/api/bookings/slots", { cache: "no-store" });
      const j = (await res.json().catch(() => ({}))) as { slots?: Slot[]; timezone?: string; error?: string };
      if (cancelled) return;
      if (res.ok && Array.isArray(j.slots)) {
        setSlots(j.slots);
        setTimezone(j.timezone || "Asia/Kolkata");
        const firstDay = j.slots[0]?.dayLabel;
        if (firstDay) {
          setSelectedDay(firstDay);
          setSelectedSlot(j.slots[0]?.iso ?? null);
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

  useEffect(() => {
    if (!selectedDay) return;
    const el = dayButtonRefs.current[selectedDay];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedDay]);

  async function bookCall(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setSubmitErr("Please pick an available slot first.");
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

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.16),transparent_36%),radial-gradient(circle_at_85%_30%,rgba(14,165,233,0.11),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.1),transparent_40%)]"
        aria-hidden
      />
      <Navbar />

      <main className="relative mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
        <section className="overflow-hidden rounded-3xl border border-blue-200/80 bg-white/90 p-7 shadow-xl shadow-blue-100/70 backdrop-blur-sm sm:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-blue-700/70">Booking Console</p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">Book a call</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Pick a date card. Pick a time card. Confirm.</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700/80">Timezone: {timezone}</p>
        </section>

        {success ? (
          <section className="mt-8 rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg shadow-emerald-100/60">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">✓</div>
              <div>
                <h2 className="font-heading text-2xl font-black text-slate-900">You are booked.</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedSlotDisplay ? `${selectedSlotDisplay} (${timezone})` : "Your slot is confirmed."}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {success.meetUrl ? (
                <a
                  href={success.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Open Google Meet
                </a>
              ) : null}
              <Link href="/" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
                Back to home
              </Link>
            </div>
            {success.meetUrl ? (
              <p className="mt-4 break-all rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                Google Meet link:{" "}
                <a href={success.meetUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                  {success.meetUrl}
                </a>
              </p>
            ) : null}
            {success.note ? <p className="mt-4 text-xs text-slate-600">{success.note}</p> : null}
            {success.meetError ? <p className="mt-2 text-xs text-amber-700">{success.meetError}</p> : null}
          </section>
        ) : (
          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 sm:p-8">
              <h2 className="font-heading text-2xl font-black text-slate-900 sm:text-3xl">Pick your slot</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Step 1 - Date card · Step 2 - Time card</p>
              {loadingSlots ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">Loading available slots...</div>
              ) : slots.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">No slots available right now.</div>
              ) : (
                <>
                  <div className="mt-6 -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2">
                    {dayLabels.map((day) => (
                      <button
                        key={day}
                        ref={(el) => {
                          dayButtonRefs.current[day] = el;
                        }}
                        type="button"
                        onClick={() => {
                          setSelectedDay(day);
                          const firstSlot = groupedByDay.get(day)?.[0];
                          setSelectedSlot(firstSlot?.iso ?? null);
                        }}
                        className={`snap-start aspect-square basis-[calc((100%-0.75rem)/2)] shrink-0 rounded-2xl border p-3 text-left transition sm:basis-[calc((100%-0.75rem)/2)] md:basis-[calc((100%-1rem)/3)] lg:basis-[calc((100%-1.5rem)/4)] ${
                          selectedDay === day
                            ? "border-blue-500 bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200/70"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                      >
                        <div className="flex h-full flex-col">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-85">{dayCardParts(day).day}</p>
                          <div className="mt-auto">
                            <p className="font-heading text-4xl font-black leading-none tracking-tight sm:text-5xl">{dayCardParts(day).num}</p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-85">
                              {dayCardParts(day).month}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {selectedDay ? `${selectedDay} - Available times` : "Available times"}
                    </p>
                    <div className="mt-4 space-y-4">
                      {(["Morning", "Afternoon", "Evening"] as const).map((period) => (
                        <div key={period} className="rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden />
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">{period}</p>
                          </div>
                          {slotsByPeriod[period].length === 0 ? (
                            <p className="mt-2 text-xs text-slate-400">No slots</p>
                          ) : (
                            <div className="mt-3 flex flex-wrap gap-2.5">
                              {slotsByPeriod[period].map((slot) => (
                                <button
                                  key={slot.iso}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot.iso)}
                                  className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                                    selectedSlot === slot.iso
                                      ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-200"
                                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50"
                                  }`}
                                >
                                  <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                                      selectedSlot === slot.iso ? "bg-white/20 text-white" : "bg-white text-blue-700"
                                    }`}
                                  >
                                    {selectedSlot === slot.iso ? "✓" : "◷"}
                                  </span>
                                  <span className="tracking-tight">{slot.timeLabel}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={bookCall} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 sm:p-8">
              <h2 className="font-heading text-2xl font-black text-slate-900">Confirm details</h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedSlotDisplay ? `Selected: ${selectedSlotDisplay}` : "Choose a slot and complete details."}
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@brand.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Brand (optional)</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Brand or company"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">What should we discuss?</label>
                  <textarea
                    rows={4}
                    required
                    value={projectSummary}
                    onChange={(e) => setProjectSummary(e.target.value)}
                    placeholder="Short context about what you need."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              {submitErr ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{submitErr}</p> : null}
              <button
                type="submit"
                disabled={submitting || loadingSlots || slots.length === 0}
                className="mt-5 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Confirming..." : "Confirm booking"}
              </button>
            </form>
          </section>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>© 2026 YourAILens Studios</p>
            <a
              href="https://instagram.com/yourailens"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-600 hover:text-blue-700"
            >
              @yourailens
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
