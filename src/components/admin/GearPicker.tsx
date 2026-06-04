"use client";

import { useEffect, useMemo, useState } from "react";
import { mergeOptions, saveCustomOption } from "@/data/gear-presets";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  builtin: readonly string[];
  storageKey: string;
};

export default function GearPicker({ label, hint, value, onChange, builtin, storageKey }: Props) {
  const [customInput, setCustomInput] = useState("");
  const [tick, setTick] = useState(0);

  const options = useMemo(() => mergeOptions(builtin, storageKey), [builtin, storageKey, tick]);

  useEffect(() => {
    if (value && !options.includes(value)) {
      saveCustomOption(storageKey, value);
      setTick((t) => t + 1);
    }
  }, [value, options, storageKey]);

  function addCustom() {
    const v = customInput.trim();
    if (!v) return;
    saveCustomOption(storageKey, v);
    onChange(v);
    setCustomInput("");
    setTick((t) => t + 1);
  }

  return (
    <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
      <label className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">{label}</label>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {options.slice(0, 10).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              value === opt
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Select or add below…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <div className="mt-2 flex gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder={`Add your own ${label.toLowerCase()}…`}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
        >
          Add
        </button>
      </div>
    </div>
  );
}
