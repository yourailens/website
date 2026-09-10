import type { StudioTeamMemberPublic } from "@/data/studio-team";

export type TeamCallSheetBeat = {
  no: string;
  title: string;
  detail: string;
};

export type TeamCallSheet = {
  unit: string;
  eyebrow: string;
  tracksLead: string;
  tracksAccent: string;
  reelLead: string;
  tracks: TeamCallSheetBeat[];
  reel: TeamCallSheetBeat[];
  signals: string[];
};

const LALITHA_BIO = `Lalitha comes from chemical engineering with a managerial lean — plant data, information, and how work actually moves, not a lab-paper track.

She interned as a data analyst, including data analysis in Excel, and holds a GATE rank certificate in chemical reaction engineering. CAD engineering drawing sits on that same technical line. Operations research and mathematical modeling are part of how she thinks.

On the picture side she has been a video editor and graphic designer at Cheat Sugar, a graphic designer for TEDx RIT, and part of UI/UX at RIT. She was in 19A design club (literature club), took a mini design project, taught English and Math at a government school, and served with NSS. Tech fest: chemical quiz.`;

export const LALITHA_TEAM_MEMBER: StudioTeamMemberPublic = {
  id: "seed-lalitha",
  slug: "lalitha",
  name: "Lalitha",
  role: "Graphic design & picture",
  short_bio: "Chemical engineering, managerial roles. She designs, cuts, and keeps the numbers honest.",
  bio: LALITHA_BIO,
  portrait_url: "/images/team/lalitha.png",
  published: true,
  sort_order: 10,
  created_at: "2026-09-10T00:00:00.000Z",
  updated_at: "2026-09-10T00:00:00.000Z",
  work: [],
  links: [],
};

const RUTUJA_BIO = `Rutuja comes from IEM with a managerial lean — marketing, strategy, and consultancy.

She did digital marketing at Cheat Sugar. A project internship at Ebin India covered LinkedIn posts and email marketing. She was a project intern at Gemini Corporation. UoV business strategy courses sit with a Google Digital Marketing course.

On campus she was debate club president at RIT, did PR and hospitality at Theatrix, and was on the E-Cell sponsorship team. NSS. Cognizant hackathon, second phase: build an AI agent. Bootcamps interviewing people in-domain. Mackezine forward program — a bootcamp into consulting roles. Drop simulation on marketing.`;

export const RUTUJA_TEAM_MEMBER: StudioTeamMemberPublic = {
  id: "seed-rutuja",
  slug: "rutuja",
  name: "Rutuja",
  role: "Marketing, strategy & consultancy",
  short_bio: "IEM, managerial work. She finds the gap in the market, then writes the line that fills it.",
  bio: RUTUJA_BIO,
  portrait_url: "/images/team/rutuja.png",
  published: true,
  sort_order: 20,
  created_at: "2026-09-10T00:00:00.000Z",
  updated_at: "2026-09-10T00:00:00.000Z",
  work: [],
  links: [],
};

const GAURI_BIO = `Gauri Shetty works across product management, data analysis, UI/UX, and electronics — semiconductor, PLC, embedded systems. Math comes in because of the coding.

An STM32 microcontroller internship covered a motor-actuation project: constant speed with variable weight. TI and Qualcomm sit on that electronics line. Ongoing research: an AI-powered smart pill dispenser with face recognition.

She was Theatrix co-design head, did UI/UX, social media management at Aarya AI, and n8n agentic AI. A student-performance analysis web app and dashboard — Claude-driven. AWS hackathon: an AI voice lead-qualification agent, a sales voice agent that filters leads on the purchase list to the most viable. Flutter fitness app: custom workouts, recipes, progress tracking. Math tutor at Auriv Learning. NSS.`;

export const GAURI_TEAM_MEMBER: StudioTeamMemberPublic = {
  id: "seed-gauri-shetty",
  slug: "gauri-shetty",
  name: "Gauri Shetty",
  role: "Product, data & electronics",
  short_bio: "Product, data, UI, the board underneath. She ships the dashboard and the circuit it runs on.",
  bio: GAURI_BIO,
  portrait_url: "/images/team/gauri-shetty.png",
  published: true,
  sort_order: 30,
  created_at: "2026-09-10T00:00:00.000Z",
  updated_at: "2026-09-10T00:00:00.000Z",
  work: [],
  links: [],
};

const CHINMAY_BIO = `Chinmay continues in chemical — process plant designer, R&D engineering in chemical plants, process design or simulation.

He is working with Sravati AI Technologies on a problem statement to design a whole process plant to a production target. Simulation software: DWSIM and ASPEN. He has created and printed 3D models.

Paper publication, co-author: research on free fatty acid reduction — result analysis, organized data analysis, visualization, and a machine learning model. Editha: research member in image navigation systems for one year. Conferences: IICHE SchemCon, BioChess by SIT. Competitions: second in IICHE Chemathon.

Cross-domain: chemical plus data analysis — NumPy, KNN, linear regressions — plus Python, C, AutoCAD, Fusion 360. Independent work: predictive analysis of chemical reactions using ML, and a digital twin for a chemical reactor using ML and RL models.`;

export const CHINMAY_TEAM_MEMBER: StudioTeamMemberPublic = {
  id: "seed-chinmay",
  slug: "chinmay",
  name: "Chinmay",
  role: "Process design & simulation",
  short_bio: "Chemical plant, simulation, the model that holds it. He designs the process, then teaches it to learn.",
  bio: CHINMAY_BIO,
  portrait_url: "/images/team/chinmay.png",
  published: true,
  sort_order: 40,
  created_at: "2026-09-10T00:00:00.000Z",
  updated_at: "2026-09-10T00:00:00.000Z",
  work: [],
  links: [],
};

const CHAKRIKA_BIO = `Chakrika works across chemical process and data — process engineering and design, petrochemical engineering, with a weekend pharmaceutical internship in research last year.

The focus line is the AI and analysis track: a minor degree in artificial intelligence, a course in Python, and an internship in data analysis.

Event management at Waveyn Sports. Theatrix. UI/UX. Cheat Sugar. NSS. Cross-domain skills, held in the same person.`;

export const CHAKRIKA_TEAM_MEMBER: StudioTeamMemberPublic = {
  id: "seed-chakrika",
  slug: "chakrika",
  name: "Chakrika",
  role: "Process, data & AI",
  short_bio: "Chemical process, a minor in AI, a data internship. She holds both rooms.",
  bio: CHAKRIKA_BIO,
  portrait_url: "/images/team/chakrika.png",
  published: true,
  sort_order: 50,
  created_at: "2026-09-10T00:00:00.000Z",
  updated_at: "2026-09-10T00:00:00.000Z",
  work: [],
  links: [],
};

export const TEAM_CALL_SHEETS: Record<string, TeamCallSheet> = {
  lalitha: {
    unit: "YAIL · T01",
    eyebrow: "Profile / Lalitha",
    tracksLead: "Picture, data, campus.",
    tracksAccent: "Same person.",
    reelLead: "What she has already made, taught, and held.",
    tracks: [
      {
        no: "01",
        title: "Design & picture",
        detail: "Video editor and graphic designer at Cheat Sugar. Graphic designer for TEDx RIT. UI/UX at RIT. Mini design project.",
      },
      {
        no: "02",
        title: "Data & operations",
        detail: "Data analyst internship. Excel analysis. Chemical plant data, information, and management. Operations research — mathematical modeling.",
      },
      {
        no: "03",
        title: "Campus & craft",
        detail: "GATE rank certificate, chemical reaction engineering. CAD engineering drawing. 19A design club. NSS. Teaching English and Math.",
      },
    ],
    reel: [
      { no: "01", title: "Cheat Sugar", detail: "Video editor and graphic designer." },
      { no: "02", title: "TEDx RIT", detail: "Graphic designer." },
      { no: "03", title: "UI/UX · RIT", detail: "Interface and visual craft on campus." },
      { no: "04", title: "19A design club", detail: "Design club — literature club." },
      { no: "05", title: "Data analyst", detail: "Internship, including analysis in Excel." },
      { no: "06", title: "GATE", detail: "Rank certificate · chemical reaction engineering." },
      { no: "07", title: "CAD drawing", detail: "Engineering drawing." },
      { no: "08", title: "Govt. school", detail: "Taught English and Math." },
      { no: "09", title: "NSS", detail: "National Service Scheme." },
      { no: "10", title: "Tech fest", detail: "Chemical quiz." },
    ],
    signals: ["Managerial roles", "Chemical dept.", "Design", "Picture", "Data"],
  },
  rutuja: {
    unit: "YAIL · T02",
    eyebrow: "Profile / Rutuja",
    tracksLead: "Marketing, strategy, campus.",
    tracksAccent: "Same person.",
    reelLead: "What she has already written, led, and argued.",
    tracks: [
      {
        no: "01",
        title: "Marketing & digital",
        detail: "Digital marketing at Cheat Sugar. Ebin India internship: LinkedIn posts and email marketing. Project intern at Gemini Corporation. Google Digital Marketing course.",
      },
      {
        no: "02",
        title: "Strategy & consultancy",
        detail: "UoV business strategy courses. Marketing consultancy: discovering vulnerabilities in marketing. Drop simulation on marketing. Mackezine forward program — bootcamp into consulting roles.",
      },
      {
        no: "03",
        title: "Campus & leadership",
        detail: "Debate club president at RIT. PR and hospitality at Theatrix. E-Cell sponsorship team. NSS. Cognizant hackathon, second phase: build an AI agent. Bootcamps interviewing people in-domain.",
      },
    ],
    reel: [
      { no: "01", title: "Cheat Sugar", detail: "Digital marketing." },
      { no: "02", title: "Ebin India", detail: "Internship: LinkedIn posts, email marketing." },
      { no: "03", title: "Gemini Corporation", detail: "Project intern." },
      { no: "04", title: "UoV", detail: "Business strategy courses." },
      { no: "05", title: "Google Digital Marketing", detail: "Course." },
      { no: "06", title: "Debate club · RIT", detail: "President." },
      { no: "07", title: "Theatrix", detail: "PR and hospitality." },
      { no: "08", title: "E-Cell", detail: "Sponsorship team." },
      { no: "09", title: "Cognizant hackathon", detail: "Second phase — build an AI agent." },
      { no: "10", title: "Mackezine", detail: "Forward program. Consulting bootcamp." },
    ],
    signals: ["IEM", "Marketing", "Strategy", "Consultancy", "Campus"],
  },
  "gauri-shetty": {
    unit: "YAIL · T03",
    eyebrow: "Profile / Gauri Shetty",
    tracksLead: "Product, data, electronics.",
    tracksAccent: "Same person.",
    reelLead: "What she has already built, wired, and shipped.",
    tracks: [
      {
        no: "01",
        title: "Product & UI",
        detail: "Product management. Front-end designing and UI/UX. Theatrix co-design head. Social media management at Aarya AI.",
      },
      {
        no: "02",
        title: "Data & agents",
        detail: "Data analysis — math from the coding. Student-performance analysis web app and dashboard, Claude-driven. n8n agentic AI. AWS hackathon: AI voice lead-qualification agent; sales voice agent that filters leads.",
      },
      {
        no: "03",
        title: "Electronics & build",
        detail: "Semiconductor, PLC, embedded systems. STM32 internship: motor actuation at constant speed with variable weight. TI and Qualcomm. Flutter fitness app. Ongoing research: AI-powered smart pill dispenser with face recognition.",
      },
    ],
    reel: [
      { no: "01", title: "STM32 internship", detail: "Motor actuation at constant speed with variable weight." },
      { no: "02", title: "Student performance app", detail: "Data analysis web app and dashboard. Claude-driven." },
      { no: "03", title: "Theatrix", detail: "Co-design head." },
      { no: "04", title: "Aarya AI", detail: "Social media management." },
      { no: "05", title: "n8n", detail: "Agentic AI." },
      { no: "06", title: "AWS hackathon", detail: "AI voice lead-qualification / sales voice agent." },
      { no: "07", title: "Flutter", detail: "Fitness app: workouts, recipes, progress tracking." },
      { no: "08", title: "Smart pill dispenser", detail: "Ongoing research. AI + face recognition." },
      { no: "09", title: "TI · Qualcomm", detail: "Electronics line." },
      { no: "10", title: "Auriv Learning", detail: "Math tutor." },
    ],
    signals: ["Product", "Data", "UI/UX", "Electronics", "AI"],
  },
  chinmay: {
    unit: "YAIL · T04",
    eyebrow: "Profile / Chinmay",
    tracksLead: "Plant, simulation, learning.",
    tracksAccent: "Same person.",
    reelLead: "What he has already designed, modelled, and published.",
    tracks: [
      {
        no: "01",
        title: "Process & plant",
        detail: "Process plant designer. R&D engineering in chemical plants — process design or simulation. Sravati AI Technologies: design a whole process plant to a production target. DWSIM and ASPEN.",
      },
      {
        no: "02",
        title: "Research & models",
        detail: "Co-author paper on free fatty acid reduction — result analysis, data analysis, visualization, machine learning model. Editha: research member in image navigation systems, one year. Created and printed 3D models.",
      },
      {
        no: "03",
        title: "Cross-domain",
        detail: "Chemical plus data analysis — NumPy, KNN, linear regressions — plus Python, C, AutoCAD, Fusion 360. Predictive analysis of chemical reactions using ML. Digital twin for a chemical reactor using ML and RL. IICHE SchemCon, BioChess by SIT. Second in IICHE Chemathon.",
      },
    ],
    reel: [
      { no: "01", title: "Sravati AI", detail: "Design a whole process plant to a production target." },
      { no: "02", title: "Free fatty acid paper", detail: "Co-author. Result analysis, visualization, ML model." },
      { no: "03", title: "Editha", detail: "Research member, image navigation systems. One year." },
      { no: "04", title: "IICHE Chemathon", detail: "Second place." },
      { no: "05", title: "IICHE SchemCon", detail: "Conference." },
      { no: "06", title: "BioChess · SIT", detail: "Conference." },
      { no: "07", title: "DWSIM · ASPEN", detail: "Chemical plant simulation." },
      { no: "08", title: "Digital twin", detail: "Chemical reactor. ML and RL models." },
      { no: "09", title: "3D models", detail: "Created and printed." },
      { no: "10", title: "AutoCAD · Fusion 360", detail: "With Python, C, NumPy, KNN." },
    ],
    signals: ["Process", "Simulation", "ML", "Research", "Chemical"],
  },
  chakrika: {
    unit: "YAIL · T05",
    eyebrow: "Profile / Chakrika",
    tracksLead: "Process, data, AI.",
    tracksAccent: "Same person.",
    reelLead: "What she has already run, interned, and held.",
    tracks: [
      {
        no: "01",
        title: "Process & chemical",
        detail: "Technical skills in chemical. Process engineering and design, petrochemical engineering. Weekend pharmaceutical internship last year — research.",
      },
      {
        no: "02",
        title: "Data & AI",
        detail: "Minor degree in artificial intelligence. Course in Python. Internship in data analysis.",
      },
      {
        no: "03",
        title: "Studio & campus",
        detail: "Event management at Waveyn Sports. Theatrix. UI/UX. Cheat Sugar. NSS. Cross-domain skills.",
      },
    ],
    reel: [
      { no: "01", title: "AI minor", detail: "Minor degree in artificial intelligence." },
      { no: "02", title: "Data analysis", detail: "Internship." },
      { no: "03", title: "Python", detail: "Course." },
      { no: "04", title: "Pharma internship", detail: "Weekend last year. Research." },
      { no: "05", title: "Petrochemical", detail: "Process engineering and design." },
      { no: "06", title: "Waveyn Sports", detail: "Event management." },
      { no: "07", title: "Theatrix", detail: "Campus craft." },
      { no: "08", title: "UI/UX", detail: "Interface and visual craft." },
      { no: "09", title: "Cheat Sugar", detail: "Studio work." },
      { no: "10", title: "NSS", detail: "National Service Scheme." },
    ],
    signals: ["Process", "Data", "AI", "Chemical", "Campus"],
  },
};

export const SEEDED_TEAM_MEMBERS: StudioTeamMemberPublic[] = [
  LALITHA_TEAM_MEMBER,
  RUTUJA_TEAM_MEMBER,
  GAURI_TEAM_MEMBER,
  CHINMAY_TEAM_MEMBER,
  CHAKRIKA_TEAM_MEMBER,
];

export function mergeSeededTeamMembers(members: StudioTeamMemberPublic[]): StudioTeamMemberPublic[] {
  const slugs = new Set(members.map((m) => m.slug));
  const extras = SEEDED_TEAM_MEMBERS.filter((m) => !slugs.has(m.slug));
  if (extras.length === 0) return members;
  return [...members, ...extras].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

export function seededTeamMemberBySlug(slug: string): StudioTeamMemberPublic | null {
  return SEEDED_TEAM_MEMBERS.find((m) => m.slug === slug) ?? null;
}
