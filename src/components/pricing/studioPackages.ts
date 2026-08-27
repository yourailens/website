export const USD_PER_INR = 84;

export type Currency = "INR" | "USD";
export type PackageId = "brand" | "speed" | "virality" | "campaign" | "custom";
export type IntentId = PackageId | "else" | "unknown";

export type GalleryItem =
  | { type: "video"; src: string; poster?: string | null; alt: string; label?: string; ratio?: "square" | "wide" | "vertical" }
  | { type: "image"; src: string; alt: string; label?: string; ratio?: "square" | "wide" | "vertical" };

export type PackageTier = {
  name: string;
  runtime: string;
  priceInr: number;
  seconds: number;
};

export type PackageHook = {
  title: string;
  blurb: string;
  youtubeId?: string;
};

export type StudioPackage = {
  id: PackageId;
  no: string;
  name: string;
  billing: string;
  priceInr: number | null;
  priceNote: string;
  runtime: string;
  /** Highlighted delivery callout */
  delivery: string;
  deliveryNote?: string;
  who: string[];
  trust: string[];
  get: string[];
  gallery: GalleryItem[];
  tiers?: PackageTier[];
  /** Attractive extra, shown after the core box and gallery */
  hook?: PackageHook;
};

export const INTENTS: {
  id: IntentId;
  letter: string;
  label: string;
  note: string;
  lands: string;
  target: PackageId;
}[] = [
  {
    id: "brand",
    letter: "A",
    label: "I need a brand that looks real. Not a logo on a white slide.",
    note: "Logo. Merch. Look. Position.",
    lands: "Brand Focus",
    target: "brand",
  },
  {
    id: "speed",
    letter: "B",
    label: "I am done making content myself. Fill my week.",
    note: "Reels every day. Image packs. Keep going.",
    lands: "Speed Focus",
    target: "speed",
  },
  {
    id: "virality",
    letter: "C",
    label: "I need hooks that stop the scroll.",
    note: "Attention first. Creativity from our side.",
    lands: "Virality Focus",
    target: "virality",
  },
  {
    id: "campaign",
    letter: "D",
    label: "Big budget. Full campaign. A to Z.",
    note: "Avatar. Film. Posts. Merch. The whole run.",
    lands: "Campaign Focus",
    target: "campaign",
  },
  {
    id: "else",
    letter: "E",
    label: "Something else. Not these four.",
    note: "Weird brief. Mixed world. Say it.",
    lands: "Custom",
    target: "custom",
  },
  {
    id: "unknown",
    letter: "F",
    label: "Honestly? I don't know yet.",
    note: "Bring the product. We will point.",
    lands: "Custom",
    target: "custom",
  },
];

export const STUDIO_PACKAGES: StudioPackage[] = [
  {
    id: "brand",
    no: "01",
    name: "Brand Focus",
    billing: "One box. One identity.",
    priceInr: 30_000,
    priceNote: "The number is the job.",
    delivery: "1 week",
    deliveryNote: "Clock starts when you lock the look.",
    runtime:
      "You have a product. You need it to look like a brand on the site, the grid, the pitch, and the room. This box builds that house first.",
    who: [
      "A founder who can describe the product, and needs the world around it to exist.",
      "A business about to launch, rebrand, or finally look like one house everywhere it shows up.",
      "Anyone posting with mismatched logos, random fonts, and merch that does not feel like them.",
    ],
    trust: [
      "You lock the look before we finish the volume. Logo, type, color, and merch direction sit in writing.",
      "Two note rounds sit in the number. If the first pass is not it, you mark it. We recut.",
      "A restart (new product, new story) is not a silent extra. We stop and quote.",
      "Need content every week after this? That is Speed Focus. Brand Focus is the identity. Speed is the cadence.",
    ],
    get: [
      "Logo system. Primary mark, lockups, and clear space you can actually use.",
      "Color and type lock. The palette and fonts that make every post look like the same house.",
      "Merch and wearables. Mockups that look real enough to sell, or to wear in a room.",
      "Brand stills and product frames in that look. Catalog, PDP, social, pitch deck.",
      "Social templates and end cards so posting does not start from a blank Canva every time.",
      "Intro and outro clips, 10 seconds each, so motion matches the stills.",
    ],
    gallery: [
      { type: "image", src: "/images/bfm1.png", alt: "Branding on fabric mocks", label: "Branding on fabric mocks" },
      { type: "image", src: "/images/bfm2.png", alt: "Photorealism mockups on humans", label: "Photorealism mockups on humans" },
      { type: "image", src: "/images/bmacro.png", alt: "Macro product shots", label: "Macro product shots", ratio: "wide" },
      { type: "image", src: "/images/bd2.jpeg", alt: "Relatable visuals for product", label: "Relatable visuals for product" },
      { type: "image", src: "/images/hqps.png", alt: "High quality product still", label: "High quality product still" },
    ],
    hook: {
      title: "Then the theme song",
      blurb:
        "Once the look is locked, we write a brand theme song and a mock music video you can run. Check this one.",
      youtubeId: "oyRDqpYCK3Q",
    },
  },
  {
    id: "speed",
    no: "02",
    name: "Speed Focus",
    billing: "Priced per week.",
    priceInr: 15_000,
    priceNote: "The week is the job. Content moves every day.",
    delivery: "1 to 2 videos per day",
    deliveryNote: "Files land through the week. Not a Friday dump.",
    runtime: "7 to 10 reels a week, 15 to 30 seconds each. 3 image packs a week, 10 images in each pack.",
    who: [
      "A team that already knows what it sells, and is tired of being the editor every night.",
      "A startup that needs the grid full, the ads running, and does not want a creative crisis every Monday.",
      "Anyone who asked 'what if I want 10 videos every week?' That week is this package.",
    ],
    trust: [
      "10 videos in a week is not a stretch goal. It is the top of the count we already priced.",
      "Two revisions sit on every video and every image pack. You mark. We recut that piece. You do not burn the whole week.",
      "Files land through the week, not as a Friday dump. You can post tomorrow.",
      "If the brief itself changes mid week (new product, new offer), we pause that piece and quote. The rest of the week still moves.",
    ],
    get: [
      "7 to 10 videos a week, 9:16 or 16:9, locked for that week.",
      "3 image packs a week. 10 images in each pack. 30 stills that match the motion.",
      "Licensed music and sound design. Voiceover when the brief needs a voice.",
      "Daily delivery across the week so the calendar does not sit empty.",
      "2 revisions per video and per image pack, in the weekly number.",
    ],
    gallery: [
      { type: "video", src: "/videos/sf01.mp4", alt: "Speed Focus reel 01", ratio: "vertical" },
      { type: "video", src: "/videos/sf02.mp4", alt: "Speed Focus reel 02", ratio: "vertical" },
      { type: "video", src: "/videos/sf03.mp4", alt: "Speed Focus reel 03", ratio: "vertical" },
      { type: "video", src: "/videos/sf04.mp4", alt: "Speed Focus reel 04", ratio: "vertical" },
    ],
  },
  {
    id: "virality",
    no: "03",
    name: "Virality Focus",
    billing: "Two lanes. Pick the hook, or the full film.",
    priceInr: null,
    priceNote: "Hook alone ₹3,000. Full film with hook ₹10,000.",
    delivery: "2 days per video",
    deliveryNote: "From lock to publish ready, for that reel.",
    runtime: "Just the hook is 5 to 10 seconds. The full film with the hook is 40 to 45 seconds.",
    tiers: [
      { name: "Just the hook", runtime: "5 to 10 seconds", priceInr: 3_000, seconds: 7 },
      { name: "Full film with hook", runtime: "40 to 45 seconds", priceInr: 10_000, seconds: 42 },
    ],
    who: [
      "A brand that does not need more content. It needs one piece people actually stop for.",
      "A founder who has the product, and wants the first three seconds to do the selling.",
      "Anyone chasing reach who is done with safe cuts of the same walkthrough.",
    ],
    trust: [
      "Creativity comes from our side, from your brief. You are not handed a template and asked to 'make it pop'.",
      "You see the hook and the idea before we finish. If the idea is wrong, we catch it there.",
      "The hook alone is publish ready in days. The full film is the whole arc, still built around that first hit.",
      "If you need this every day, that is Speed Focus. Virality is the piece built to travel.",
    ],
    get: [
      "Just the hook: a 5 to 10 second attention cut. ₹3,000. Licensed music and sound. Two note rounds.",
      "Full film with hook: 40 to 45 seconds. The hook opens it. The rest sells. ₹10,000.",
      "Voiceover when the hook needs a voice. A still from the film for the cover.",
      "Publish ready masters in the size we lock (9:16 or 16:9).",
      "Extra rounds quoted first. A new product mid cut is a new line.",
    ],
    gallery: [
      { type: "video", src: "/videos/vf01.mp4", alt: "Virality Focus reel 01" },
      { type: "video", src: "/videos/vf02.mp4", alt: "Virality Focus reel 02" },
      { type: "video", src: "/videos/vf03.mp4", alt: "Virality Focus reel 03" },
      { type: "video", src: "/videos/vf04.mp4", alt: "Virality Focus reel 04" },
    ],
  },
  {
    id: "campaign",
    no: "04",
    name: "Campaign Focus",
    billing: "One campaign box.",
    priceInr: 50_000,
    priceNote: "The number is the campaign.",
    delivery: "3 weeks",
    deliveryNote: "Run of show across the full campaign build.",
    runtime: "A 5 minute AI film at the centre, plus the system that lets the campaign run.",
    who: [
      "A launch with a real media plan, not a single post date.",
      "A funded team that needs one world to live in ads, YouTube, the grid, the site, and the room.",
      "Anyone who said huge budget and meant they want A to Z, not another pack of five clips.",
    ],
    trust: [
      "You are buying the campaign machine: a face, a sound, a type system, a film, and the assets that keep the weeks looking like one house.",
      "We write a run of show. You know what lands which week. You are not guessing if 'the rest' will appear.",
      "Satisfaction is locked in pieces. Avatar, look, music, then the 5 minute film, then the weekly assets. You see the world before the volume.",
      "If you only need identity, that is Brand Focus. If you only need daily posts, that is Speed Focus. This is the full run.",
    ],
    get: [
      "A brand avatar the campaign can keep using. A face, a character, a presence on camera that does not reset every ad.",
      "Visuals, posters, typography, and merch so the campaign can live off the phone as well as on it.",
      "Music, voiceovers, posts, short ads, and long form YouTube in the same language.",
      "A special 5 minute AI film as the centrepiece of the run.",
      "Producer run of show across the weeks or months you actually need to be in market.",
    ],
    gallery: [
      { type: "video", src: "/videos/hero3.mp4", poster: "/videos/hero3-poster.jpg", alt: "Campaign teaser", ratio: "wide" },
    ],
  },
  {
    id: "custom",
    no: "05",
    name: "Custom",
    billing: "We quote it.",
    priceInr: null,
    priceNote: "Say the thing. We write the scope back. One number. What is in. What is not.",
    delivery: "Written on the quote",
    deliveryNote: "Days sit next to the number, before we start.",
    runtime: "Whatever the brief actually is. Mixed films and stills. A single odd piece. A world we did not list.",
    who: [
      "You have something else in mind, and none of the four lanes is it.",
      "You don't know what you want yet. That is a valid starting point. Bring the product. We will point.",
      "You need a mix: Brand Focus plus a week of Speed, or a campaign that is smaller than A to Z.",
    ],
    trust: [
      "We do not force you into a lane to make the page tidy. If the brief is weird, the quote is weird, in writing.",
      "You get the same rule as the rest of the shop. We quote before we start. No surprise invoice for the job you already bought.",
      "If after the call Brand, Speed, Virality, or Campaign is actually the fit, we will say so. You do not pay extra to be told that.",
    ],
    get: [
      "A 15 minute call, or an email, where we listen first.",
      "A written scope. One number. Days. What is in. What is not.",
      "The same finishing bar as the named packages: licensed music, grade, masters you can run.",
      "Revisions and extras quoted as lines, before we do them.",
    ],
    gallery: [],
  },
];

export function money(amountInr: number, currency: Currency) {
  if (currency === "USD") {
    return `$${Math.round(amountInr / USD_PER_INR).toLocaleString("en-US")}`;
  }
  return `₹${amountInr.toLocaleString("en-IN")}`;
}

export function perSecond(amountInr: number, seconds: number, currency: Currency) {
  if (seconds <= 0) return money(amountInr, currency);
  return money(Math.round(amountInr / seconds), currency);
}
