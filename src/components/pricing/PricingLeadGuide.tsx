import Image from "next/image";
import Link from "next/link";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";

const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";
const HAND = { fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" } as const;
const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

const BEATS = [
  {
    no: "01",
    title: "Talk",
    you: "Book fifteen minutes. Or email. Bring the product and what you need it for.",
    we: "We listen. We point you at a box, or we say custom.",
    money: "₹0",
    moneyNote: "The call is free.",
  },
  {
    no: "02",
    title: "Pick",
    you: "Choose the box. Or send a weird brief.",
    we: "We write the scope back. One number. What is in. What is not.",
    money: "The box",
    moneyNote: "That number is the job.",
  },
  {
    no: "03",
    title: "Lock",
    you: "Approve the script (films) or the look (stills), and the size.",
    we: "Clock starts. The days on the box begin here.",
    money: "The box",
    moneyNote: "Nothing extra. The box already covers this.",
  },
  {
    no: "04",
    title: "Make",
    you: "Wait. Answer a question if we ping you.",
    we: "We write, generate, cut, grade, and mix. Credits and music are in the box.",
    money: "The box",
    moneyNote: "Still the box.",
  },
  {
    no: "05",
    title: "Fix",
    you: "Watch. Mark what to change. Send one note list per round.",
    we: "We recut that film, or retouch those stills. Not a new product. Not a new film.",
    money: "In the box",
    moneyNote: "Starter 2 · Growth 3 · Signature 4 · Product 2 · Campaign 3. Extra round ₹3,000, quoted first.",
  },
  {
    no: "06",
    title: "Hand",
    you: "Take the files. Run them.",
    we: "Masters, licensed music, commercial use of the finished work.",
    money: "The box",
    moneyNote: "Raws + source files are ₹5,000 if you want them. Quoted first.",
  },
] as const;

const STILL_EXAMPLES = [
  { src: "/images/cologne.png", alt: "Fragrance product still", label: "Hero" },
  { src: "/images/shoe.png", alt: "Footwear campaign still", label: "Lifestyle" },
  { src: "/images/w2.png", alt: "Watch detail still", label: "Detail" },
] as const;

function CropMarks() {
  return (
    <>
      <span className="pointer-events-none absolute left-2 top-2 z-10 h-3 w-3 border-l border-t border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute right-2 top-2 z-10 h-3 w-3 border-r border-t border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 left-2 z-10 h-3 w-3 border-b border-l border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 right-2 z-10 h-3 w-3 border-b border-r border-blue-400" aria-hidden />
    </>
  );
}

const FIXES = [
  { box: "Starter", kind: "Films", rounds: "2", days: "7" },
  { box: "Growth", kind: "Films", rounds: "3", days: "10" },
  { box: "Signature", kind: "Films", rounds: "4", days: "14" },
  { box: "Product", kind: "Stills", rounds: "2", days: "5" },
  { box: "Campaign", kind: "Stills", rounds: "3", days: "8" },
] as const;

const LOCKED_IN = [
  "The count on the box. 3 films, or 12 stills, or whatever it says.",
  "The days on the box. Clock starts when you lock script and size.",
  "Script and music, on films. Credits included.",
  "The sizes listed. Extra sizes are regenerated, so they cost.",
  "The fixes listed. Extra rounds are ₹3,000, quoted first.",
  "Finished masters you can run in ads.",
] as const;

const NOT_IN = [
  "A new film, a new SKU, or a new campaign after we started.",
  "An extra size. Platform pack ₹5,000.",
  "A 24 hour rush. ₹8,000, if we have the slot.",
  "Raw project files. ₹5,000.",
  "Unlimited changes. A fix is a round of notes, not a restart.",
] as const;

const QUESTIONS = [
  {
    q: "I don't know what a film is.",
    a: "Here it is a short commercial. Moving pictures, 40 to 45 seconds on Starter. Not a feature. Not a documentary. An ad.",
  },
  {
    q: "Do I need films or photos?",
    a: "Need it to move, talk, or hold a beat? Film. Need it on a page, a listing, or a static ad? Stills. Need both? Talk to us. That is custom, or two boxes.",
  },
  {
    q: "What if I pick the wrong box?",
    a: "Tell us on the call. We will say so. Moving up a box before we lock is easy. Changing the product after we have cut is a new line.",
  },
  {
    q: "Will the price jump?",
    a: "Not for what is on the box. Extra work is a new line, quoted before we do it. You never get a surprise invoice for the job you already bought.",
  },
  {
    q: "How many times can I change it?",
    a: "The rounds are written on each box. 2, 3, or 4. One list of notes per round. Need another round? ₹3,000, quoted first.",
  },
  {
    q: "What if I hate the first cut?",
    a: "That is what the fixes are for. Mark it. We recut. If the brief itself changed (new product, new story), that is not a fix. We stop and quote.",
  },
  {
    q: "How do we actually talk?",
    a: "A free 15 minute call to start. Then email. We write the box back. We send the script or look. We send each cut. You reply with notes. Instagram @yourailens if you just want to poke us.",
  },
  {
    q: "When do I pay? When does the clock start?",
    a: "The number on the box is the job. We start after you confirm it. The days begin when you lock script, look, and size. Not before.",
  },
  {
    q: "What do I get at the end?",
    a: "Finished masters. The films or stills in the sizes you locked. Licensed music on films. You can run them commercially. Raws are extra if you want the project files.",
  },
  {
    q: "Can my boss ask for a different size later?",
    a: "Yes. That is a regenerate. Extra size is ₹5,000. We quote it, you say yes, we make it.",
  },
] as const;

export function PricingJumpRow({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 ${className ?? ""}`}
    >
      <Link href="#what" className="hover:text-blue-900">
        Examples
      </Link>
      <span className="text-blue-300" aria-hidden>
        ·
      </span>
      <Link href="#how" className="hover:text-blue-900">
        How it goes
      </Link>
      <span className="text-blue-300" aria-hidden>
        ·
      </span>
      <Link href="#talk" className="hover:text-blue-900">
        How we talk
      </Link>
      <span className="text-blue-300" aria-hidden>
        ·
      </span>
      <Link href="#locked" className="hover:text-blue-900">
        What is locked
      </Link>
      <span className="text-blue-300" aria-hidden>
        ·
      </span>
      <Link href="#questions" className="hover:text-blue-900">
        The questions
      </Link>
    </div>
  );
}

export function PricingWhatIs() {
  return (
    <section id="what" className="scroll-mt-24 border-t border-blue-100/60 bg-white py-16 lg:py-24" data-examples="lead">
      <div className={PAGE}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">You are the lead</p>
          <h2
            className="mt-3 text-[clamp(2rem,5vw,3.8rem)] font-light text-slate-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            You start <span className="font-semibold text-blue-700">like this</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            Two jobs. We show the work. Then we explain what you bought, and how the week actually runs.
          </p>
        </div>

        <article className="mt-12 overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-4 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-600">Example 01 · Films</p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">Starter</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative border-b border-blue-100 bg-black lg:border-b-0 lg:border-r">
              <CropMarks />
              <div className="relative aspect-video overflow-hidden">
                <DeferredVideo
                  src="/videos/hero5.mp4"
                  poster="/videos/hero5-poster.jpg"
                  rootMargin="1400px"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />
                <p className="pointer-events-none absolute bottom-2.5 left-2.5 text-[11px] font-light text-white">
                  Earbuds
                </p>
              </div>
            </div>

            <div className="px-5 py-8 sm:px-8 sm:py-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">You say</p>
              <p className="mt-3 text-xl font-light leading-snug text-slate-900" style={HAND}>
                I sell earbuds. I need ads I can run this month.
              </p>
              <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">Then we explain</p>
              <ul className="mt-4 space-y-3 text-sm font-light leading-relaxed text-slate-600">
                <li>That moving picture is a film. A short commercial. Not a movie. About 40 to 45 seconds.</li>
                <li>
                  You buy <span className="text-slate-900">Starter</span>. Three of these. ₹30,000. Seven days. Two
                  fixes.
                </li>
                <li>You pick one size. Phone, or YouTube. Extra sizes are regenerated, so they cost.</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-100 px-5 py-8 sm:px-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">How you start</p>
            <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { no: "01", t: "Talk", d: "You book fifteen minutes. Free. You bring the product." },
                { no: "02", t: "Pick", d: "We say Starter. You confirm. That number is the job." },
                { no: "03", t: "Lock", d: "We send a script. You approve it, and the size. Clock starts." },
                { no: "04", t: "Make", d: "We cut it. You wait. Seven days on the box." },
                { no: "05", t: "Fix · Hand", d: "You mark notes. Two rounds. Then the files. You run them." },
              ].map((beat) => (
                <li key={beat.no}>
                  <p className="font-mono text-[9px] tracking-[0.16em] text-blue-500">{beat.no}</p>
                  <p className="mt-2 text-sm font-light text-slate-900">{beat.t}</p>
                  <p className="mt-1 text-[13px] font-light leading-relaxed text-slate-500">{beat.d}</p>
                </li>
              ))}
            </ol>
            <Link
              href="/pricing/starter-ai-commercial"
              className="mt-8 inline-flex text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
            >
              Open Starter →
            </Link>
          </div>
        </article>

        <article className="mt-8 overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-4 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-600">Example 02 · Stills</p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">Product</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid grid-cols-3 border-b border-blue-100 lg:border-b-0 lg:border-r">
              {STILL_EXAMPLES.map((still) => (
                <figure key={still.src} className="relative border-r border-blue-100 last:border-r-0">
                  <div className="relative aspect-square bg-slate-50">
                    <Image src={still.src} alt={still.alt} fill sizes="20vw" className="object-cover" />
                  </div>
                  <figcaption className="border-t border-blue-100 bg-white px-2 py-1.5 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
                    {still.label}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="px-5 py-8 sm:px-8 sm:py-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">You say</p>
              <p className="mt-3 text-xl font-light leading-snug text-slate-900" style={HAND}>
                My product page has no photos. I need them this week.
              </p>
              <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">Then we explain</p>
              <ul className="mt-4 space-y-3 text-sm font-light leading-relaxed text-slate-600">
                <li>Those are stills. Photos. No motion. Same studio. Same lock.</li>
                <li>
                  You buy <span className="text-slate-900">Product</span>. Twelve stills. ₹15,000. Five days. Two
                  fixes.
                </li>
                <li>Need a whole campaign look? That is Campaign. Twenty eight stills. ₹35,000.</li>
              </ul>
              <Link
                href="/pricing/product-visuals-pack"
                className="mt-8 inline-flex text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
              >
                Open Product →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function PricingHowItGoes() {
  return (
    <HomeBlueTint id="how" className="scroll-mt-24 border-t border-blue-100/60 py-16 lg:py-24">
      <div className={PAGE}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">The job, in six beats</p>
          <h2
            className="mt-3 text-[clamp(2rem,5vw,3.8rem)] font-light text-slate-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            How it <span className="font-semibold text-blue-700">goes</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            What you do. What we do. What money moves. Nothing after this is a surprise.
          </p>
        </div>

        <div className="mt-12 overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-4 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-600">YAIL · Run of show</p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">PROD · 002</p>
            </div>
          </div>

          <div className="relative border-b border-blue-100 px-5 py-8 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {BEATS.map((beat, index) => (
                <div key={beat.no} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`border border-blue-600 bg-white px-3 py-2 shadow-sm sm:px-4 ${
                      index === 1 ? "rotate-[-2deg]" : index === 4 ? "rotate-[1.5deg]" : "rotate-[-0.8deg]"
                    }`}
                  >
                    <p className="text-sm font-light text-slate-900 sm:text-base" style={HAND}>
                      {beat.title.toUpperCase()}
                    </p>
                  </div>
                  {index < BEATS.length - 1 ? (
                    <span className="text-lg font-light text-blue-400" aria-hidden>
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <ol className="divide-y divide-blue-100">
            {BEATS.map((beat) => (
              <li key={beat.no} className="grid gap-4 px-5 py-6 sm:px-8 lg:grid-cols-[4.5rem_1fr_1fr_9rem] lg:gap-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-blue-500">{beat.no}</p>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">You</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-slate-700">{beat.you}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Us</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-slate-700">{beat.we}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-600">Money</p>
                  <p className="mt-1 text-lg font-light leading-none text-slate-900">{beat.money}</p>
                  <p className="mt-2 text-[11px] font-light leading-relaxed text-slate-500">{beat.moneyNote}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </HomeBlueTint>
  );
}

export function PricingHowWeTalk() {
  return (
    <section id="talk" className="scroll-mt-24 border-t border-blue-100/60 bg-white py-16 lg:py-24">
      <div className={PAGE}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">You will not chase us</p>
          <h2
            className="mt-3 text-[clamp(2rem,5vw,3.8rem)] font-light text-slate-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            How we <span className="font-semibold text-blue-700">talk</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            One call. Then writing. You always know what happens next.
          </p>
        </div>

        <div className="mt-12 overflow-hidden border border-blue-200 bg-white">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative border-b border-blue-100 px-6 py-10 sm:px-10 sm:py-14 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
              <div className="relative">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">Three doors</p>
                <ul className="mt-6 space-y-5">
                  <li>
                    <p className="text-base font-light text-slate-900">A 15 minute call</p>
                    <p className="mt-1 text-sm font-light text-slate-500">Free. We point you at a box.</p>
                    <Link
                      href="/contact"
                      className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
                    >
                      Book it →
                    </Link>
                  </li>
                  <li className="border-t border-blue-100 pt-5">
                    <p className="text-base font-light text-slate-900">Email</p>
                    <p className="mt-1 text-sm font-light text-slate-500">Where the work lives after the call.</p>
                    <a
                      href={`mailto:${SITE_CONTACT_EMAIL}`}
                      className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
                    >
                      {SITE_CONTACT_EMAIL}
                    </a>
                  </li>
                  <li className="border-t border-blue-100 pt-5">
                    <p className="text-base font-light text-slate-900">Instagram</p>
                    <p className="mt-1 text-sm font-light text-slate-500">If you just want to poke us.</p>
                    <a
                      href="https://instagram.com/yourailens"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
                    >
                      @yourailens
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-10 sm:px-10 sm:py-14">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">What we send you</p>
              <ol className="mt-6 space-y-5">
                {[
                  { no: "01", t: "After the call", d: "Which box. What is in it. The number. In writing." },
                  { no: "02", t: "After you lock", d: "The script, or the look. The size. The days." },
                  { no: "03", t: "When it is ready", d: "The first cut, or the first stills." },
                  { no: "04", t: "After each fix", d: "The next cut. We do not go quiet." },
                  { no: "05", t: "When it is done", d: "The masters. Then we stay on email if something breaks." },
                ].map((row) => (
                  <li key={row.no} className="flex gap-4">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-blue-500">{row.no}</span>
                    <div>
                      <p className="text-sm font-light text-slate-900">{row.t}</p>
                      <p className="mt-1 text-sm font-light text-slate-500">{row.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PricingLocked() {
  return (
    <HomeBlueTint id="locked" className="scroll-mt-24 border-t border-blue-100/60 py-16 lg:py-24">
      <div className={PAGE}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">In writing</p>
          <h2
            className="mt-3 text-[clamp(2rem,5vw,3.8rem)] font-light text-slate-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            What is <span className="font-semibold text-blue-700">locked</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            Guaranteed means it is on the box. Extra means we quote it before we do it.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="border border-blue-200 bg-white p-6 sm:p-8">
            <p className="rotate-[-2deg] inline-block border border-blue-600 bg-white px-3 py-1.5 text-lg text-slate-900 shadow-sm" style={HAND}>
              In the box
            </p>
            <ul className="mt-6 space-y-3">
              {LOCKED_IN.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                  <span className="text-blue-600" aria-hidden>
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-blue-200 bg-white p-6 sm:p-8">
            <p className="rotate-[2deg] inline-block border-2 border-blue-700 bg-blue-600 px-3 py-1.5 text-lg text-white shadow-sm" style={HAND}>
              Not in the box
            </p>
            <ul className="mt-6 space-y-3">
              {NOT_IN.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                  <span className="text-blue-400" aria-hidden>
                    ×
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-4 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">The fixes</p>
                <p className="mt-1 text-sm font-light text-slate-500">One round = one list of notes on the work we already made.</p>
              </div>
              <p className="text-[11px] font-light text-slate-400">Extra round ₹3,000 · quoted first</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <thead>
                <tr className="border-b border-blue-100 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-5 py-3 font-medium sm:px-8">Box</th>
                  <th className="px-5 py-3 font-medium sm:px-8">Kind</th>
                  <th className="px-5 py-3 font-medium sm:px-8">Fixes in the box</th>
                  <th className="px-5 py-3 font-medium sm:px-8">Days</th>
                </tr>
              </thead>
              <tbody>
                {FIXES.map((row) => (
                  <tr key={row.box} className="border-t border-blue-50 text-sm font-light text-slate-700">
                    <td className="px-5 py-3.5 sm:px-8">{row.box}</td>
                    <td className="px-5 py-3.5 text-slate-500 sm:px-8">{row.kind}</td>
                    <td className="px-5 py-3.5 sm:px-8">{row.rounds}</td>
                    <td className="px-5 py-3.5 sm:px-8">{row.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HomeBlueTint>
  );
}

export function PricingLeadQuestions() {
  return (
    <section id="questions" className="scroll-mt-24 border-t border-blue-100/60 bg-white py-16 lg:py-24">
      <div className={PAGE}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">In your head, already</p>
          <h2
            className="mt-3 text-[clamp(2rem,5vw,3.8rem)] font-light text-slate-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            The <span className="font-semibold text-blue-700">questions</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            The ones you would ask on the call. Written down so you do not have to.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-blue-100 overflow-hidden border border-blue-200 bg-white">
          {QUESTIONS.map((row, i) => (
            <div key={row.q} className="grid gap-2 px-5 py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8 sm:px-8 sm:py-6">
              <p className="flex gap-3 text-sm font-light text-slate-900">
                <span className="font-mono text-[10px] tracking-[0.14em] text-blue-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {row.q}
              </p>
              <p className="pl-8 text-sm font-light leading-relaxed text-slate-600 sm:pl-0">{row.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm font-light text-slate-500">Still stuck. That is fine.</p>
          <Link
            href="/contact"
            className="mt-4 inline-block rotate-[-1.5deg] border-2 border-blue-700 bg-blue-600 px-6 py-3 text-lg font-light text-white shadow-sm"
            style={HAND}
          >
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
