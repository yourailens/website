import { Noto_Sans_Kannada } from "next/font/google";

const kannada = Noto_Sans_Kannada({
  weight: ["600"],
  subsets: ["kannada"],
  display: "swap",
});

/** Karnataka flag: yellow over red. The bilingual name sits beside it. */
export default function KarnatakaMark({
  tone = "on-red",
}: {
  tone?: "on-red" | "on-ink" | "on-gold";
}) {
  const onGold = tone === "on-gold";
  const ink = onGold ? "text-black" : tone === "on-red" ? "text-kannada-ivory" : "text-kannada-gold";
  const quiet = onGold ? "text-black/70" : tone === "on-red" ? "text-kannada-ivory/80" : "text-kannada-ivory/70";
  return (
    <div className="flex items-center gap-3">
      <span className={onGold ? "bg-black p-1" : ""} aria-hidden>
        <span
          className={`flex h-11 w-8 shrink-0 flex-col overflow-hidden rounded-[2px] ring-1 ${
            onGold ? "ring-black" : "ring-kannada-ivory/40"
          }`}
        >
          <span className="min-h-0 flex-1 bg-kannada-gold" />
          <span className="min-h-0 flex-1 bg-kannada-red" />
        </span>
      </span>
      <span className="min-w-0">
        <span className={`${kannada.className} block text-[1.05rem] leading-none ${ink}`}>
          ಕರ್ನಾಟಕ ಸರ್ಕಾರ
        </span>
        <span className={`mt-1 block font-heading text-[0.95rem] leading-none tracking-[0.04em] ${quiet}`}>
          Government of Karnataka
        </span>
      </span>
    </div>
  );
}
