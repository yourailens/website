const SERVICES = [
  {
    label: "AI Video Ads",
    desc: "Scroll stopping video content",
    icon: "▶",
    color: "bg-blue-50 text-blue-600",
    detail: "AI generated video ads, reels, and brand films produced at a fraction of traditional cost. From concept to delivery in days, not weeks.",
  },
  {
    label: "Brand Design",
    desc: "Identity & visual systems",
    icon: "◈",
    color: "bg-violet-50 text-violet-600",
    detail: "Logo design, brand guidelines, and visual identity systems. We create brands that resonate and stand out in a crowded market.",
  },
  {
    label: "AI Powered Ads",
    desc: "Campaigns that scale",
    icon: "◎",
    color: "bg-emerald-50 text-emerald-600",
    detail: "Data driven ad creative combined with AI targeting and optimization. Maximum reach, minimum budget waste.",
  },
  {
    label: "Social Media",
    desc: "Content that converts",
    icon: "◉",
    color: "bg-pink-50 text-pink-600",
    detail: "Strategy, content calendars, and AI powered post creation across Instagram, TikTok, LinkedIn and more.",
  },
  {
    label: "Web Design",
    desc: "Digital experiences",
    icon: "⬡",
    color: "bg-amber-50 text-amber-600",
    detail: "Responsive websites and landing pages built for conversion. Fast, beautiful, and optimized for every device.",
  },
  {
    label: "AI Avatars & Voice",
    desc: "Scalable spokespersons",
    icon: "⟡",
    color: "bg-cyan-50 text-cyan-600",
    detail: "Photorealistic AI avatars and multilingual voiceovers for ads, explainers, and demos. Create consistent brand video content at scale.",
  },
];

export default function ServiceDropdown() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SERVICES.map((s) => (
        <div
          key={s.label}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${s.color}`}>{s.icon}</span>
          <div>
            <p className="font-semibold text-slate-900">{s.label}</p>
            <p className="mt-0.5 text-xs text-slate-700">{s.desc}</p>
          </div>
          <p className="mt-auto text-xs leading-relaxed text-slate-600">{s.detail}</p>
        </div>
      ))}
    </div>
  );
}
