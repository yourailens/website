"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const RANGE = [
  {
    type: "Static / brochure",
    application: "Brand presence, portfolios, campaign landers",
    field: "Studios, freelancers, local business",
    intensity: "Light",
  },
  {
    type: "Marketing site",
    application: "Lead gen, product storytelling, SEO content",
    field: "D2C, SaaS, agencies",
    intensity: "Medium",
  },
  {
    type: "E commerce",
    application: "Catalogs, checkout, inventory sync",
    field: "Retail, food, fashion",
    intensity: "High",
  },
  {
    type: "Web app / portal",
    application: "Dashboards, auth, ops workflows",
    field: "Internal tools, B2B, education",
    intensity: "High",
  },
  {
    type: "AI product surface",
    application: "Assistants, generation, search, automation",
    field: "Any vertical with content or support load",
    intensity: "Very high",
  },
  {
    type: "Studio / admin systems",
    application: "CMS desks, media libraries, publishing",
    field: "Media, production, ops teams",
    intensity: "High",
  },
] as const;

const STACK = [
  { label: "Frontend", items: "Next.js · React · TypeScript · Tailwind" },
  { label: "Backend", items: "APIs · Auth · Databases · Edge functions" },
  { label: "AI layer", items: "Chat · Agents · Automation · Content pipelines" },
  { label: "Ship", items: "Vercel · AWS · CI · Analytics · SEO" },
] as const;

const EDGE = [
  {
    code: "01",
    title: "Applied AI methods",
    body: "We use AI inside the build process and inside the product. Specs, drafts, assets, and logic move faster without the usual agency drag.",
  },
  {
    code: "02",
    title: "Leaner than market style",
    body: "No bloated timelines or padded squads. Tight scope, clear architecture, and shipping loops that stay efficient from brief to launch.",
  },
  {
    code: "03",
    title: "Faster production",
    body: "Parallel design and engineering, reusable systems, and AI assisted production cut weeks off the clock compared to traditional web shops.",
  },
] as const;

const STEPS = [
  { n: "01", title: "Brief", body: "Goals, users, pages, and the AI pieces that matter." },
  { n: "02", title: "Build", body: "Design and ship in the open. Modern stack. Clean architecture." },
  { n: "03", title: "Integrate", body: "APIs, models, and automations plugged into real use." },
  { n: "04", title: "Launch", body: "Deploy, measure, iterate. You own the code and the keys." },
] as const;

export default function WebDevExperience() {
  return (
    <div className="ott-home relative min-h-screen overflow-x-hidden bg-black font-body text-white">
      <Navbar />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 18% 0%, rgba(37,99,235,0.32), transparent 55%), radial-gradient(ellipse 40% 35% at 90% 8%, rgba(29,78,216,0.16), transparent 50%)",
        }}
        aria-hidden
      />

      <section className="relative mx-auto max-w-[90rem] px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CHANNEL · WEB</p>

        <h1 className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
          <span className="sr-only">YAIL WebDev</span>
          <Image
            src="/images/logo_yail.png"
            alt=""
            width={640}
            height={220}
            priority
            className="h-[clamp(2.6rem,9vw,5.5rem)] w-auto select-none"
            aria-hidden
          />
          <span className="font-body text-[clamp(2.4rem,8vw,5.2rem)] font-semibold leading-none tracking-tight text-white">
            WebDev
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
          We build full stack websites with the latest tech and AI integration. Experienced across
          every type of site, every field of use, and every intensity of build.
        </p>

        <p className="mt-5 font-mono text-[11px] tracking-[0.18em] text-blue-300">
          Starting from ₹25,000 · static websites
        </p>

        <div className="mt-8">
          <Link
            href="/contact"
            className="relative inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-blue-400/55 bg-transparent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 shadow-[inset_0_1px_0_rgba(96,165,250,0.25)] backdrop-blur-md transition hover:border-blue-300 hover:text-blue-200"
          >
            Start a build
          </Link>
        </div>
      </section>

      <section className="relative border-y border-white/10">
        <div className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 sm:py-14 lg:px-16">
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">RANGE</p>
          <h2 className="mt-3 font-body text-[clamp(1.5rem,3.2vw,2.4rem)] font-semibold leading-none tracking-tight">
            Any type of website. Any field.
          </h2>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/55">
            We have shipped across formats, applications, and intensities. From a light static
            brochure to a heavy AI product surface. Same desk. Clear parameters.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/15 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  <th className="py-3 pr-4 font-normal">Type</th>
                  <th className="py-3 pr-4 font-normal">Application</th>
                  <th className="py-3 pr-4 font-normal">Field</th>
                  <th className="py-3 font-normal">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {RANGE.map((row) => (
                  <tr key={row.type} className="border-b border-white/10 align-top">
                    <td className="py-4 pr-4 font-semibold text-white">{row.type}</td>
                    <td className="py-4 pr-4 text-white/60">{row.application}</td>
                    <td className="py-4 pr-4 text-white/60">{row.field}</td>
                    <td className="py-4 text-blue-300">{row.intensity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[90rem] px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">WHY US</p>
        <h2 className="mt-3 font-body text-[clamp(1.5rem,3.2vw,2.4rem)] font-semibold leading-none tracking-tight">
          Not market style. Faster. Sharper.
        </h2>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/55">
          Traditional web production is slow, layered, and expensive. Our work runs on applied AI
          methodologies, so builds stay efficient and timelines stay short without cutting quality.
        </p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {EDGE.map((item) => (
            <li key={item.code} className="border border-white/12 bg-white/[0.02] px-5 py-6">
              <p className="font-mono text-[10px] tracking-[0.22em] text-blue-300">{item.code}</p>
              <p className="mt-2 font-body text-lg font-semibold leading-none tracking-tight">
                {item.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative border-y border-white/10">
        <div className="mx-auto grid max-w-[90rem] sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((row) => (
            <div
              key={row.label}
              className="border-b border-white/10 px-5 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-8"
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-blue-400">{row.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{row.items}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-16">
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">HOW IT RUNS</p>
          <h2 className="mt-3 font-body text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold leading-none tracking-tight">
            Brief. Build. Launch.
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n}>
                <p className="font-mono text-[10px] tracking-[0.22em] text-blue-300">{step.n}</p>
                <p className="mt-2 font-body text-lg font-semibold leading-none tracking-tight sm:text-xl">
                  {step.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-24 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">NEXT</p>
        <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-none tracking-tight">
          Tell us what you need online. We will wire the stack and the AI.
        </h2>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-white"
        >
          <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" aria-hidden />
          Book a call
        </Link>
      </section>
    </div>
  );
}
