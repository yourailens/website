import Link from "next/link";
import Navbar from "@/components/Navbar";

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "From ₹2,00,000",
    desc: "Perfect for early-stage brands ready to make their mark.",
    features: [
      "Logo and basic brand guidelines",
      "1 round of revisions",
      "2 week delivery",
      "Source files included",
    ],
    featured: false,
  },
  {
    name: "Growth",
    price: "From ₹6,00,000",
    desc: "For brands that are ready to scale fast and stand out.",
    features: [
      "Full brand identity system",
      "Web design up to 5 pages",
      "3 rounds of revisions",
      "4 to 6 week delivery",
      "Ongoing support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For larger teams, complex campaigns, and bold ambitions.",
    features: [
      "End to end brand and campaign",
      "AI powered ad creative",
      "Dedicated account manager",
      "Unlimited revisions",
      "Custom timeline",
    ],
    featured: false,
  },
];

const ADDONS = [
  { name: "Social media kit", price: "+₹65,000" },
  { name: "Brand video (30s)", price: "+₹1,25,000" },
  { name: "Photography session", price: "+₹1,65,000" },
  { name: "Copywriting", price: "+₹42,000 per page" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-slate-100 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">
            Transparent Pricing
          </span>
          <h1
            className="font-heading text-[clamp(2.5rem,6vw,5rem)] font-black text-slate-900"
            style={{ letterSpacing: "-0.03em" }}
          >
            Simple, honest pricing.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-slate-700">
            No surprises. No hidden fees. Every plan is fixed price, fully scoped,
            and ready to kick off within 24 hours.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section
        className="py-20 lg:py-24"
        style={{ background: "linear-gradient(150deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-3xl p-8 lg:p-10 ${
                  tier.featured
                    ? "border-2 border-blue-500 bg-white shadow-xl shadow-blue-100"
                    : "border border-slate-200 bg-white shadow-md"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-200">
                    Most popular
                  </span>
                )}
                <div className="mb-6">
                  <h2 className="font-heading text-2xl font-black text-slate-900">{tier.name}</h2>
                  <div
                    className={`mt-3 text-3xl font-black lg:text-4xl ${
                      tier.featured ? "text-blue-600" : "text-slate-900"
                    }`}
                  >
                    {tier.price}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{tier.desc}</p>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block rounded-2xl py-3.5 text-center text-sm font-bold transition-all ${
                    tier.featured
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                      : "border border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {tier.name === "Enterprise" ? "Talk to us" : "Get started"}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-700">
            All prices are starting points. Final quote depends on scope.
          </p>
        </div>
      </section>

      {/* Add-ons */}
      <section className="border-t border-slate-100 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">
              Optional
            </span>
            <h2
              className="font-heading text-[clamp(2rem,4vw,3rem)] font-black text-slate-900"
              style={{ letterSpacing: "-0.03em" }}
            >
              Add-ons
            </h2>
            <p className="mt-3 text-slate-700">Layer on exactly what you need. Nothing more.</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            {ADDONS.map((addon, i) => (
              <div
                key={addon.name}
                className={`flex items-center justify-between px-8 py-5 ${
                  i !== ADDONS.length - 1 ? "border-b border-slate-200" : ""
                }`}
              >
                <span className="font-medium text-slate-800">{addon.name}</span>
                <span className="font-bold text-blue-600">{addon.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 lg:py-24"
        style={{ background: "linear-gradient(150deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)" }}
      >
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
          <h2
            className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-black text-slate-900"
            style={{ letterSpacing: "-0.03em" }}
          >
            Have a custom project?
          </h2>
          <p className="mt-4 text-lg text-slate-700">
            Not sure which plan fits? Tell us about your goals and we will build a package just for you.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:bg-blue-700"
            >
              Book a free call
            </Link>
            <a
              href="mailto:hello@yourailens.studio"
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600"
            >
              hello@yourailens.studio
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="font-heading text-xl font-bold text-slate-900">
              YourAI<span className="text-blue-600">Lens</span>
              <span className="ml-2 text-xs font-normal text-slate-700">Studios</span>
            </Link>
            <a
              href="https://instagram.com/yourailens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-700 transition-colors hover:text-slate-900"
            >
              @yourailens
            </a>
            <p className="text-xs text-slate-700">© 2026 YourAILens Studios</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
