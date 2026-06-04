"use client";

import { useMemo, useState } from "react";
import { mergeOptions, saveCustomOption } from "@/data/gear-presets";

type Props = {
  label: string;
  hint?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  builtin: readonly string[];
  storageKey: string;
};

export default function PresetChips({ label, hint, selected, onChange, builtin, storageKey }: Props) {
  const [customInput, setCustomInput] = useState("");
  const [tick, setTick] = useState(0);
  const options = useMemo(() => mergeOptions(builtin, storageKey), [builtin, storageKey, tick]);

  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  }

  function addCustom() {
    const v = customInput.trim();
    if (!v) return;
    saveCustomOption(storageKey, v);
    if (!selected.includes(v)) onChange([...selected, v]);
    setCustomInput("");
    setTick((t) => t + 1);
  }

  return (
    <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">{label}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selected.includes(opt)
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder="Add custom…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <button type="button" onClick={addCustom} className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800">
          Add
        </button>
      </div>
    </div>
  );
}
