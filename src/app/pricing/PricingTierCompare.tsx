"use client";

import { useState } from "react";

const ROWS = [
  { label: "Strategic discovery call", spark: true, momentum: true, signature: true },
  { label: "AI led creative direction", spark: true, momentum: true, signature: true },
  { label: "Campaign / asset volume", spark: "Focused", momentum: "Expanded", signature: "Full funnel" },
  { label: "Revision rounds", spark: "1", momentum: "2", signature: "3" },
  { label: "Channel variants (sizes / crops)", spark: "Core set", momentum: "Multi platform", signature: "Full pack + variants" },
  { label: "Sound & voice guidance", spark: "None", momentum: "Add on", signature: "Included" },
  { label: "Delivery priority", spark: "Standard", momentum: "Priority", signature: "White glove" },
] as const;

export default function PricingTierCompare() {
  const [emphasis, setEmphasis] = useState<"spark" | "momentum" | "signature" | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Highlight tier:</span>
        {(
          [
            { id: "spark" as const, label: "Spark" },
            { id: "momentum" as const, label: "Momentum" },
            { id: "signature" as const, label: "Signature" },
            { id: null, label: "Clear" },
          ] as const
        ).map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => setEmphasis(b.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              emphasis === b.id
                ? "bg-slate-900 text-white shadow-lg"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/80 shadow-inner">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              <th className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:px-6">
                Capability
              </th>
              <th
                className={`px-3 py-4 text-center font-heading text-xs font-black uppercase tracking-wide sm:px-4 ${
                  emphasis === "spark" ? "bg-amber-50 text-amber-950 ring-1 ring-amber-200/80" : "text-slate-800"
                }`}
              >
                Spark
              </th>
              <th
                className={`px-3 py-4 text-center font-heading text-xs font-black uppercase tracking-wide sm:px-4 ${
                  emphasis === "momentum" ? "bg-blue-50 text-blue-950 ring-1 ring-blue-200/80" : "text-slate-800"
                }`}
              >
                Momentum
              </th>
              <th
                className={`px-3 py-4 text-center font-heading text-xs font-black uppercase tracking-wide sm:px-4 ${
                  emphasis === "signature" ? "bg-violet-50 text-violet-950 ring-1 ring-violet-200/80" : "text-slate-800"
                }`}
              >
                Signature
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3.5 font-medium text-slate-800 sm:px-6">{row.label}</td>
                <td
                  className={`px-3 py-3.5 text-center text-slate-600 sm:px-4 ${
                    emphasis === "spark" ? "bg-amber-50/50" : ""
                  }`}
                >
                  {typeof row.spark === "boolean" ? (
                    row.spark ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                    ) : (
                      "No"
                    )
                  ) : (
                    row.spark
                  )}
                </td>
                <td
                  className={`px-3 py-3.5 text-center text-slate-600 sm:px-4 ${
                    emphasis === "momentum" ? "bg-blue-50/50" : ""
                  }`}
                >
                  {typeof row.momentum === "boolean" ? (
                    row.momentum ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                    ) : (
                      "No"
                    )
                  ) : (
                    row.momentum
                  )}
                </td>
                <td
                  className={`px-3 py-3.5 text-center text-slate-600 sm:px-4 ${
                    emphasis === "signature" ? "bg-violet-50/50" : ""
                  }`}
                >
                  {typeof row.signature === "boolean" ? (
                    row.signature ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                    ) : (
                      "No"
                    )
                  ) : (
                    row.signature
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
