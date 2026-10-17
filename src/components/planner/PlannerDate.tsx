"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseValue(value: string, withTime: boolean) {
  if (!value) return null;
  if (withTime) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }
  const [y, m, day] = value.split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

function labelOf(value: string, withTime: boolean) {
  const d = parseValue(value, withTime);
  if (!d) return "";
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  let h = d.getHours();
  const min = pad(d.getMinutes());
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${date}, ${h}:${min} ${ap}`;
}

function toHour(h24: number) {
  return h24 % 12 || 12;
}

export default function PlannerDate({
  value,
  onChange,
  withTime = false,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  placeholder?: string;
}) {
  const selected = parseValue(value, withTime);
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [cursor, setCursor] = useState(() => selected ?? new Date());
  const [picked, setPicked] = useState<Date | null>(selected);
  const [hour, setHour] = useState(() => (selected ? toHour(selected.getHours()) : 9));
  const [minute, setMinute] = useState(() => (selected ? selected.getMinutes() : 0));
  const [ap, setAp] = useState<"AM" | "PM">(() => (selected && selected.getHours() >= 12 ? "PM" : "AM"));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
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

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const start = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const out: (number | null)[] = [];
    for (let i = 0; i < start; i++) out.push(null);
    for (let d = 1; d <= count; d++) out.push(d);
    while (out.length % 7) out.push(null);
    return out;
  }, [cursor]);

  function emit(day: Date, h12 = hour, min = minute, period: "AM" | "PM" = ap) {
    if (!withTime) {
      onChange(`${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`);
      setOpen(false);
      return;
    }
    let h = h12 % 12;
    if (period === "PM") h += 12;
    if (period === "AM" && h12 === 12) h = 0;
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, min, 0, 0);
    onChange(next.toISOString());
  }

  function openPicker() {
    const rect = root.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setDropUp(below < 460 && rect.top > below);
    }
    const base = selected ?? new Date();
    setCursor(base);
    setPicked(selected);
    if (selected) {
      setHour(toHour(selected.getHours()));
      setMinute(selected.getMinutes());
      setAp(selected.getHours() >= 12 ? "PM" : "AM");
    }
    setOpen((v) => !v);
  }

  const today = new Date();

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={openPicker}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white/[0.06] px-3.5 py-2.5 text-left text-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl ${
          open ? "border-white/40" : "border-white/15"
        }`}
      >
        <span className={value ? "text-white" : "text-white/40"}>{labelOf(value, withTime) || placeholder}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/55" fill="none" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div
          className={`absolute z-50 w-[19.5rem] overflow-hidden rounded-[22px] border border-white/20 bg-[#161618] p-0 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.85)] ${
            dropUp ? "bottom-[calc(100%+0.5rem)]" : "mt-2"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="text-[15px] font-semibold text-white">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                <path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="px-3 pb-3 pt-2">
            <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wide text-white/35">
              {WEEK.map((d) => (
                <span key={d} className="py-1.5">
                  {d}
                </span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <span key={`e-${i}`} />;
                const cell = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                const active = picked ?? selected;
                const isSel =
                  active &&
                  active.getDate() === day &&
                  active.getMonth() === cursor.getMonth() &&
                  active.getFullYear() === cursor.getFullYear();
                const isToday =
                  today.getDate() === day &&
                  today.getMonth() === cursor.getMonth() &&
                  today.getFullYear() === cursor.getFullYear();
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setPicked(cell);
                      emit(cell);
                    }}
                    className={`h-9 rounded-xl text-[13px] transition ${
                      isSel
                        ? "bg-[#f4f4f5] font-semibold text-[#111]"
                        : isToday
                          ? "text-white ring-1 ring-white/35 hover:bg-white/10"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {withTime ? (
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                <span className="text-[12px] text-white/45">Time</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={hour}
                  onChange={(e) => {
                    const next = Math.min(12, Math.max(1, Number(e.target.value) || 1));
                    setHour(next);
                    if (picked) emit(picked, next, minute, ap);
                  }}
                  className="w-14 rounded-lg border border-white/15 bg-black px-2 py-1.5 text-center text-[14px] text-white outline-none focus:border-white/40"
                />
                <span className="text-white/40">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={pad(minute)}
                  onChange={(e) => {
                    const next = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                    setMinute(next);
                    if (picked) emit(picked, hour, next, ap);
                  }}
                  className="w-14 rounded-lg border border-white/15 bg-black px-2 py-1.5 text-center text-[14px] text-white outline-none focus:border-white/40"
                />
                <div className="ml-auto flex rounded-full border border-white/15 p-0.5">
                  {(["AM", "PM"] as const).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setAp(slot);
                        if (picked) emit(picked, hour, minute, slot);
                      }}
                      className={`rounded-full px-2.5 py-1 text-[12px] ${
                        ap === slot ? "bg-[#f4f4f5] font-semibold text-[#111]" : "text-white/70"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-3 py-2.5">
            <button
              type="button"
              className="text-[13px] text-white/70 hover:text-white"
              onClick={() => {
                onChange("");
                setPicked(null);
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-full bg-[#f4f4f5] px-3.5 py-1.5 text-[13px] font-semibold text-[#111]"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
