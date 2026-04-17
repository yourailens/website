"use client";

import { useEffect } from "react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "From ₹2,00,000",
    desc: "Perfect for early-stage brands",
    features: [
      "Logo & basic brand guidelines",
      "1 round of revisions",
      "2 week delivery",
      "Source files included",
    ],
  },
  {
    name: "Growth",
    price: "From ₹6,00,000",
    desc: "For brands ready to scale",
    features: [
      "Full brand identity system",
      "Web design (up to 5 pages)",
      "3 rounds of revisions",
      "4 to 6 week delivery",
      "Ongoing support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For larger teams & campaigns",
    features: [
      "End-to-end brand & campaign",
      "AI-powered ad creative",
      "Dedicated account manager",
      "Unlimited revisions",
      "Custom timeline",
    ],
  },
];

const ADDONS = [
  { name: "Social media kit", price: "+₹65,000" },
  { name: "Brand video (30s)", price: "+₹1,25,000" },
  { name: "Photography session", price: "+₹1,65,000" },
  { name: "Copywriting", price: "+₹42,000/page" },
];

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden />
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl lg:max-h-[calc(100vh-3rem)] lg:max-w-[calc(100vw-3rem)] lg:min-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-100 px-6 py-5 lg:px-12 lg:py-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:text-slate-700 lg:right-8 lg:top-8"
            aria-label="Close"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold text-slate-900 lg:text-4xl">Pricing</h3>
          <p className="mt-1 text-sm text-slate-700 lg:text-base lg:mt-2">
            Transparent pricing for every stage of your brand journey.
          </p>
        </div>

        {/* Content - vertical on mobile, horizontal on desktop */}
        <div className="flex-1 overflow-y-auto px-6 py-5 lg:overflow-x-auto lg:overflow-y-hidden lg:px-12 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            {/* Pricing tiers */}
            <div className="flex flex-col gap-6 lg:flex-1 lg:flex-row lg:gap-8">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 lg:min-w-[260px] lg:flex-1 lg:p-8"
                >
                  <div className="mb-3 flex items-baseline justify-between lg:flex-col lg:items-start lg:gap-2 lg:mb-5">
                    <h4 className="font-bold text-slate-900 lg:text-xl">{tier.name}</h4>
                    <span className="text-lg font-bold text-blue-600 lg:text-2xl">{tier.price}</span>
                  </div>
                  <p className="mb-4 text-sm text-slate-700 lg:text-base lg:mb-6">{tier.desc}</p>
                  <ul className="space-y-2 lg:space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-700 lg:text-base">
                        <span className="text-blue-500">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Add-ons */}
            <div className="shrink-0 border-t border-slate-200 pt-6 lg:min-w-[280px] lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
              <h4 className="mb-4 font-bold text-slate-900 lg:text-xl lg:mb-6">Add-ons</h4>
              <ul className="space-y-3 lg:space-y-4">
                {ADDONS.map((addon) => (
                  <li key={addon.name} className="flex justify-between gap-4 text-sm text-slate-700 lg:text-base">
                    <span>{addon.name}</span>
                    <span className="shrink-0 text-slate-700">{addon.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 lg:px-12 lg:py-6">
          <p className="mb-3 text-center text-xs text-slate-700 lg:text-sm">
            All prices are starting points. Final quote depends on scope.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 lg:py-4 lg:text-lg"
          >
            Get a custom quote
          </button>
        </div>
      </div>
    </div>
  );
}
