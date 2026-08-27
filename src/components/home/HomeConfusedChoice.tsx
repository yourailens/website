import Link from "next/link";

const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

const HAND = { fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" } as const;

const PACKAGES = [
  {
    no: "01",
    name: "Brand Focus",
    price: "₹30,000",
    delivery: "1 week",
    href: "/pricing#pkg-brand",
    inside: ["Logo + type + color", "Merch mocks", "Brand stills"],
  },
  {
    no: "02",
    name: "Speed Focus",
    price: "₹15,000 / week",
    delivery: "1 to 2 videos / day",
    href: "/pricing#pkg-speed",
    inside: ["7 to 10 reels", "3 image packs", "Daily delivery"],
  },
  {
    no: "03",
    name: "Virality Focus",
    price: "From ₹3,000",
    delivery: "2 days per video",
    href: "/pricing#pkg-virality",
    inside: ["Hook 5 to 10s", "Full film 40 to 45s", "Publish ready"],
  },
  {
    no: "04",
    name: "Campaign Focus",
    price: "₹50,000",
    delivery: "3 weeks",
    href: "/pricing#pkg-campaign",
    inside: ["Avatar + visuals", "5 min AI film", "Full run of show"],
  },
] as const;

export default function HomeConfusedChoice() {
  return (
    <div className="mt-8 overflow-hidden border border-blue-200 bg-white">
      <div className="relative border-b border-blue-100 px-5 py-8 text-center sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-blue-600">Four boxes. Or custom.</p>
          <h3
            className="mt-3 text-[clamp(2.4rem,6vw,4.2rem)] font-light leading-none text-slate-900"
            style={{ ...HAND, letterSpacing: "-0.03em" }}
          >
            Confused?
          </h3>
          <p className="mt-3 text-sm font-light text-slate-500">A = pick a package. B = we quote yours.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_auto_0.75fr]">
        <div className="relative px-5 py-8 sm:px-7">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
          <div className="relative">
            <div className="mb-6 inline-block rotate-[-2deg] border border-blue-600 bg-white px-4 py-2 shadow-sm">
              <p className="text-2xl font-light text-slate-900" style={HAND}>
                A · Packages
              </p>
            </div>
            <p className="mb-6 max-w-sm text-sm font-light text-slate-600">
              You pick a box. What is on it is what is in it.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {PACKAGES.map((pack, index) => (
                <Link
                  key={pack.name}
                  href={pack.href}
                  className={`border border-blue-200 bg-white p-4 shadow-sm transition hover:border-blue-600 hover:shadow-md ${
                    index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
                  }`}
                >
                  <p className="font-mono text-[9px] tracking-[0.2em] text-blue-500">{pack.no}</p>
                  <p className="mt-2 text-lg font-light text-slate-900">{pack.name}</p>
                  <p className="mt-3 text-[clamp(1.25rem,2vw,1.5rem)] font-light leading-none text-blue-700">
                    {pack.price}
                  </p>
                  <p className="mt-1 text-[11px] font-light text-slate-400">{pack.delivery}</p>
                  <ul className="mt-3 space-y-1 border-t border-blue-100 pt-3">
                    {pack.inside.map((item) => (
                      <li key={item} className="flex items-baseline gap-2 text-[12px] font-light text-slate-600">
                        <span className="text-blue-600" aria-hidden>
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>

            <p className="mt-5 text-[12px] font-light text-slate-500" style={HAND}>
              need seconds, not a box? →
              <Link href="/pricing#alacarte" className="ml-1 text-blue-700">
                a la carte
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center border-y border-blue-100 bg-blue-50/40 px-4 py-3 lg:border-x lg:border-y-0">
          <p className="rotate-[8deg] text-xl font-light text-blue-600" style={HAND} aria-hidden>
            or
          </p>
        </div>

        <div className="relative flex flex-col justify-center px-5 py-10 sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
          <div className="relative">
            <div className="mb-6 inline-block rotate-[2deg] border-2 border-blue-700 bg-blue-600 px-4 py-2 shadow-sm">
              <p className="text-2xl font-semibold text-white" style={HAND}>
                B · Custom
              </p>
            </div>
            <p className="max-w-[16rem] text-lg font-light leading-snug text-slate-800">
              Your idea isn&apos;t on the shelf.
            </p>
            <p className="mt-3 max-w-[16rem] text-sm font-light leading-relaxed text-slate-600">
              Weird brief? Mixed stills + films? Just say it. We quote it.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rotate-[-1.5deg] border-2 border-blue-700 bg-white px-6 py-3 text-lg font-light text-slate-900 shadow-sm transition hover:bg-blue-600 hover:text-white"
              style={HAND}
            >
              Talk to us
            </Link>
            <Link
              href="/pricing#custom"
              className="mt-4 inline-flex text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
            >
              Custom on pricing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
