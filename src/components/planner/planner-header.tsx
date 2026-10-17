"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type PlannerHeaderBits =
  | { kind: "tasks"; open: number; done: number }
  | { kind: "followups"; due: number; won: number }
  | { kind: "directory"; count: number };

const SetCtx = createContext<((bits: PlannerHeaderBits | null) => void) | null>(null);
const BitsCtx = createContext<PlannerHeaderBits | null>(null);

export function PlannerHeaderProvider({ children }: { children: React.ReactNode }) {
  const [bits, setBits] = useState<PlannerHeaderBits | null>(null);
  return (
    <SetCtx.Provider value={setBits}>
      <BitsCtx.Provider value={bits}>{children}</BitsCtx.Provider>
    </SetCtx.Provider>
  );
}

export function usePlannerHeaderBits() {
  return useContext(BitsCtx);
}

export function useSetPlannerHeader(bits: PlannerHeaderBits) {
  const setBits = useContext(SetCtx);
  const key =
    bits.kind === "tasks"
      ? `tasks:${bits.open}:${bits.done}`
      : bits.kind === "followups"
        ? `followups:${bits.due}:${bits.won}`
        : `directory:${bits.count}`;
  useEffect(() => {
    setBits?.(bits);
    return () => setBits?.(null);
    // key captures the values that should refresh the header
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setBits]);
}
