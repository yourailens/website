"use client";

import PlannerDate from "@/components/planner/PlannerDate";

export default function MeetBook({
  booked,
  when,
  onBooked,
  onWhen,
}: {
  booked: boolean;
  when: string | null;
  onBooked: (booked: boolean) => void;
  onWhen: (iso: string | null) => void;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/25 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Next meet</p>
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-white/[0.06] p-1">
        <button
          type="button"
          aria-pressed={!booked}
          onClick={() => onBooked(false)}
          className={`min-h-11 rounded-full text-[14px] font-semibold ${
            booked ? "text-[#ff8a8a]" : "bg-[#e50914] text-white shadow-[0_8px_18px_-10px_rgba(229,9,20,0.95)]"
          }`}
        >
          Not booked
        </button>
        <button
          type="button"
          aria-pressed={booked}
          onClick={() => onBooked(true)}
          className={`min-h-11 rounded-full text-[14px] font-semibold ${
            booked ? "bg-[#7c3aed] text-white shadow-[0_8px_18px_-10px_rgba(124,58,237,0.95)]" : "text-[#c4b5fd]"
          }`}
        >
          Booked
        </button>
      </div>
      {booked ? (
        <div className="mt-3">
          <PlannerDate withTime value={when ?? ""} placeholder="When is it" onChange={(value) => onWhen(value || null)} />
        </div>
      ) : null}
    </div>
  );
}
