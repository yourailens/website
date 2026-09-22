export type ProposalStat = {
  value: string;
  label: string;
  hint?: string;
};

export type ProposalBar = {
  label: string;
  value: number; // 0–100
  display: string;
};

export type ProposalTimelineItem = {
  phase: string;
  range: string;
  title: string;
  points: string[];
  metric?: string;
};

export type ProposalMindNode = {
  label: string;
  detail: string;
};

export type ProposalFunnelStep = {
  step: string;
  label: string;
  detail: string;
};

export type ProposalSlide = {
  kicker: string;
  title: string;
  body?: string;
  bullets?: string[];
  note?: string;
  columns?: { label: string; text: string; metric?: string }[];
  stats?: ProposalStat[];
  bars?: ProposalBar[];
  timeline?: ProposalTimelineItem[];
  mindmap?: { center: string; nodes: ProposalMindNode[] };
  funnel?: ProposalFunnelStep[];
};

export type ProposalDeck = {
  slug: string;
  client: string;
  clientUrl?: string;
  title: string;
  subtitle: string;
  tag: string;
  dateLabel: string;
  slides: ProposalSlide[];
};

export const PROPOSAL_DECKS: ProposalDeck[] = [
  {
    slug: "nalapad-academy-genai-pr",
    client: "Nalapad Academy",
    clientUrl: "https://nalapadacademy.in/",
    title: "GenAI PR Strategy",
    subtitle:
      "A parent-facing, admissions-led GenAI video system — numbers, timelines, and a content map for Bangalore’s Cambridge campus.",
    tag: "EDUCATION · PR · GENAI VIDEO",
    dateLabel: "Proposal · 2026",
    slides: [
      {
        kicker: "01 · COVER",
        title: "Nalapad Academy × YourAILens",
        body: "Turn Nest → Primary → Secondary excellence into a weekly GenAI film channel that drives tours, trust, and share-of-voice against peer international schools.",
        stats: [
          { value: "90", label: "Day launch plan", hint: "Pilot → cadence → admissions sprint" },
          { value: "24+", label: "Films in Q1", hint: "6 pilot + ~18 always-on" },
          { value: "3", label: "Core channels", hint: "IG Reels · YT Shorts · WhatsApp" },
          { value: "4", label: "Strategy pillars", hint: "Proof · People · Place · Path" },
        ],
        note: "Prepared for Nalapad Academy · Indiranagar, Bangalore · Cambridge pathway",
      },
      {
        kicker: "02 · THE OPPORTUNITY",
        title: "Parents decide in the feed — then book the tour.",
        body: "Nalapad already wins offline (Cambridge, STEM, mentorship, Apple-smart rooms). The unlock is a measurable digital layer that converts scroll → trust → visit.",
        stats: [
          { value: "70%+", label: "Parents research online first", hint: "Before campus visit" },
          { value: "3–7s", label: "Hook window", hint: "Vertical video attention" },
          { value: "1×/wk", label: "Min. film cadence", hint: "To stay top-of-mind" },
        ],
        bars: [
          { label: "Offline brand strength (campus, awards, Cambridge)", value: 88, display: "Strong" },
          { label: "Always-on cinematic content presence", value: 28, display: "Gap" },
          { label: "Peer schools GenAI / film PR maturity", value: 35, display: "Low–mid" },
          { label: "Nalapad upside if gap closes", value: 82, display: "High" },
        ],
        bullets: [
          "Competitors still lean on stock stills + open-day flyers — film is differentiation.",
          "GenAI removes film-crew latency: weekly quality without festival-week costs.",
          "One visual system can serve admissions, Nest marketing, STEM pride, and parent WhatsApp.",
        ],
      },
      {
        kicker: "03 · STRATEGY MAP",
        title: "One hub. Four pillars. One funnel.",
        mindmap: {
          center: "NALAPAD\nGENAI PR",
          nodes: [
            { label: "PROOF", detail: "Cambridge · STEM · awards as cinema, not claims" },
            { label: "PEOPLE", detail: "Mentors · Nest · student makers as cast" },
            { label: "PLACE", detail: "Indiranagar campus as a recurring world" },
            { label: "PATH", detail: "Discover → trust → open day → apply" },
          ],
        },
        funnel: [
          { step: "01", label: "Discover", detail: "Campus World trailers · STEM shorts" },
          { step: "02", label: "Trust", detail: "Mentor films · parent testimonials" },
          { step: "03", label: "Visit", detail: "Open-day trailers · tour CTAs" },
          { step: "04", label: "Apply", detail: "Seat alerts · pathway explainers" },
        ],
        note: "Every asset maps to a pillar + a funnel step — no orphan posts.",
      },
      {
        kicker: "04 · CONTENT SYSTEM",
        title: "Monthly production math",
        body: "A fixed mix so Nalapad never looks empty — and never looks salesy.",
        stats: [
          { value: "8", label: "Films / month", hint: "Steady-state after pilot" },
          { value: "12", label: "Stills / month", hint: "Carousels · WA · ads" },
          { value: "30–45s", label: "Hero film length", hint: "Campus World" },
          { value: "15–25s", label: "Shorts length", hint: "Reels / Shorts" },
        ],
        columns: [
          {
            label: "CAMPUS WORLD",
            metric: "2 / mo",
            text: "30–45s trailers for Nest, Primary, Secondary — cinematic campus identity.",
          },
          {
            label: "DAY-IN-LIFE",
            metric: "2 / mo",
            text: "Student + mentor micro-stories for Reels / Shorts / Stories.",
          },
          {
            label: "STEM / ROBOTICS",
            metric: "2 / mo",
            text: "GenAI + real hybrid demos proving future-ready learning.",
          },
          {
            label: "TRUST + ADMITS",
            metric: "2 / mo",
            text: "Parent films, Cambridge explainers, open-day pulses, soft CTAs.",
          },
        ],
        note: "Child-safe, warm, international tone — never generic “AI chrome.”",
      },
      {
        kicker: "05 · 90-DAY TIMELINE",
        title: "Pilot → cadence → admissions sprint",
        timeline: [
          {
            phase: "01",
            range: "Days 1–30",
            title: "Foundation + pilot",
            metric: "6 films live",
            points: [
              "Brand bible + talent / campus sheets",
              "Nest + Secondary pilot package (6 films + stills)",
              "Soft launch: Instagram + YouTube Shorts",
              "Baseline KPIs: saves, profile visits, tour form starts",
            ],
          },
          {
            phase: "02",
            range: "Days 31–60",
            title: "Weekly engine",
            metric: "~8 films / mo",
            points: [
              "Lock weekly cadence + series calendar",
              "Robotics / language / mentorship arcs",
              "Parent remarketing stills + cutdowns",
              "Open-day trailer + landing variants",
            ],
          },
          {
            phase: "03",
            range: "Days 61–90",
            title: "Admissions sprint",
            metric: "Scale winners",
            points: [
              "Seat / tour / fair creatives",
              "Alumni + community stories",
              "Performance review → paid PR boost on top 20%",
              "Retainer scope for Q2 locked",
            ],
          },
        ],
        bars: [
          { label: "Organic reach goal (indexed)", value: 70, display: "↑ Month 3" },
          { label: "Tour enquiries attributed to content", value: 55, display: "Track" },
          { label: "Content share-of-voice vs peer schools", value: 65, display: "Lead" },
        ],
        note: "North-star: tour bookings with a clear content touch in the last 14 days.",
      },
      {
        kicker: "06 · INVESTMENT SHAPE",
        title: "Clear next steps — with numbers.",
        stats: [
          { value: "90 min", label: "Kickoff workshop", hint: "Voice · do’s/don’ts · heroes" },
          { value: "3 wks", label: "Pilot delivery", hint: "6 films + stills + guide" },
          { value: "6", label: "Pilot films", hint: "First wave package" },
          { value: "Q2", label: "Retainer decision", hint: "After 90-day proof" },
        ],
        bullets: [
          "Week 0: Align priority segment — Nest, Primary, Secondary, or all-campus.",
          "Week 1: Kickoff + world bible (characters, campus rules, safety).",
          "Weeks 2–3: Produce & package pilot (6 GenAI films + stills + posting guide).",
          "Day 30 review: keep / kill / scale formats by save-rate & tour assists.",
          "Day 90: convert winning cadence into always-on retainer + optional paid PR.",
        ],
        note: "yourailens.studio · Proposal Hub · Build the campus the internet remembers.",
      },
    ],
  },
];

export function getProposalDeck(slug: string): ProposalDeck | undefined {
  return PROPOSAL_DECKS.find((d) => d.slug === slug);
}
