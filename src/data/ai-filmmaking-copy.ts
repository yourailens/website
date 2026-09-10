/** Editorial copy for /ai-filmmaking */

export const AI_FILMMAKING = {
  hero: {
    eyebrow: "Studio practice",
    title: "AI",
    accent: "Filmmaking",
    body: "Commercials were the proof. Next we make cinema — longer stories, returning characters, and worlds you can walk into.",
  },
  promise: {
    eyebrow: "What this is",
    title: "Not a forty five second ad.",
    accent: "A film.",
    body: "YourAILens Studios applies the same visual standard you see in our commercials to longer narrative work. Direction first. Continuity held. Finish that feels shot.",
  },
  pillars: [
    {
      no: "01",
      title: "Longer stories",
      detail: "Runtime that breathes. Acts, not hooks. Scenes that earn the cut.",
    },
    {
      no: "02",
      title: "Characters who return",
      detail: "Same faces across chapters. Wardrobe, voice, and gesture that persist.",
    },
    {
      no: "03",
      title: "Worlds you can enter",
      detail: "Sets held in continuity. Light, geography, and props that stay true.",
    },
  ],
  craft: {
    eyebrow: "Craft",
    title: "How a film holds together",
    body: "Generative tools are the camera department. Taste, continuity, and finishing are still the director.",
    items: [
      {
        title: "World bible",
        detail: "Look, cast, locations, and rules locked before we generate a frame.",
      },
      {
        title: "Character continuity",
        detail: "Identity sheets so talent stays recognizable across every scene.",
      },
      {
        title: "Cinematography",
        detail: "Lens language, camera moves, and lighting that feel intentional — not accidental.",
      },
      {
        title: "Finish",
        detail: "Edit, grade, sound, and titles. The last ten percent that makes it cinema.",
      },
    ],
  },
  process: {
    eyebrow: "Process",
    title: "From brief to locked cut",
    steps: [
      { no: "01", label: "Story & brief", detail: "One conversation. Tone, audience, runtime, and the feeling we chase." },
      { no: "02", label: "World & cast", detail: "References, character sheets, locations, and a shot plan." },
      { no: "03", label: "Generate & direct", detail: "Scene by scene synthesis under creative direction — not prompt spam." },
      { no: "04", label: "Edit & finish", detail: "Picture lock, grade, sound design, and delivery masters." },
    ],
  },
  reel: {
    eyebrow: "The reel so far",
    title: "Proof in motion",
    body: "Commercials that already carry cinematic craft. The bridge into longer AI films.",
  },
  formats: {
    eyebrow: "Formats",
    title: "What we can deliver",
    items: [
      { title: "Short films", detail: "Three to twelve minutes. Festival or brand narrative." },
      { title: "Serialized chapters", detail: "Returning characters. Episodic worlds." },
      { title: "Brand cinema", detail: "Sponsored stories that feel like films first." },
      { title: "Key art & stills", detail: "Posters, frames, and campaign stills from the same world." },
    ],
  },
  cta: {
    eyebrow: "Start a production",
    title: "Bring us the story.",
    accent: "We'll build the world.",
  },
} as const;

export const AI_FILMMAKING_REEL = [
  {
    no: "01",
    title: "Done & Dusted",
    kind: "Product commercial",
    video: "/videos/d&d.mp4",
    poster: "/videos/dnd-poster.jpg",
  },
  {
    no: "02",
    title: "The Teaser",
    kind: "Launch film",
    video: "/videos/hero3.mp4",
    poster: "/videos/hero3-poster.jpg",
  },
  {
    no: "03",
    title: "Fine Sugar",
    kind: "Campaign film",
    video: "/videos/hero2.mp4",
    poster: "/videos/hero2-poster.jpg",
  },
  {
    no: "04",
    title: "India in Olympics",
    kind: "Narrative film",
    video: "/videos/india-in-olympics.mp4",
    poster: "/videos/india-in-olympics-poster.jpg",
  },
] as const;
