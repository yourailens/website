"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ContactModal from "@/components/ContactModal";
import VideoModal from "@/components/VideoModal";
import PricingModal from "@/components/PricingModal";
import FAQAccordion from "@/components/FAQAccordion";
import ServiceDropdown from "@/components/ServiceDropdown";
import ImagePopup from "@/components/ImagePopup";

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80",
  "https://images.unsplash.com/photo-1552581234-26160f608093?w=600&q=80",
];

const GRID_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
];

const CAROUSEL_ROW2 = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80",
  "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&q=80",
  "https://images.unsplash.com/photo-1617802690658-1173a812650d?w=600&q=80",
];

const AI_MODELS = [
  { name: "Higgsfield", version: "Studio 2.0", logo: "/images/logos/higgsfield.png" },
  { name: "Kling AI", version: "3.0", logo: "/images/logos/kling.png" },
  { name: "OpenAI", version: "GPT-4o", logo: "/images/logos/openai.png" },
  { name: "Claude", version: "3.5", logo: "/images/logos/anthropic.png" },
  { name: "NanoBanana Pro", version: "Gemini 2.0", logo: "/images/logos/gemini-star.svg" },
  { name: "Grok", version: "3.0", logo: "/images/logos/grok-official.jpg" },
  { name: "Veo", version: "3.0", logo: "/images/logos/veo.svg" },
  { name: "Seedance", version: "5.0", logo: "/images/logos/seedream.svg" },
  { name: "Eleven Labs", version: "v3", logo: "/images/logos/elevenlabs.png" },
  { name: "Minimax", version: "M2.5", logo: "/images/logos/minimax.svg" },
];

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [popupImage, setPopupImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="min-h-screen bg-black">

      {/* Hero */}
      <div className="overflow-hidden bg-black pb-10 pt-14 lg:pt-20">
        {/* Title */}
        <div className="mb-10 flex flex-col items-center px-6 text-center">
          <h1 className="font-heading text-5xl font-bold tracking-wide text-white lg:text-7xl xl:text-8xl">
            YourAILens
          </h1>
          <div className="mt-3 flex w-full max-w-md items-end justify-center gap-3 px-6 lg:mt-4 lg:max-w-lg lg:gap-4">
            <div className="flex flex-1 items-center">
              <div className="h-[2px] flex-1 rounded-full" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.6) 100%)" }} />
              <div className="h-1.5 w-1.5 shrink-0 rotate-45 bg-white/70" />
            </div>
            <p className="font-studio shrink-0 px-1 text-center text-2xl font-semibold tracking-[0.25em] text-white/95 lg:text-3xl xl:text-4xl">
              STUDIO
            </p>
            <div className="flex flex-1 flex-col items-end">
              <div className="flex w-full items-center">
                <div className="h-1.5 w-1.5 shrink-0 rotate-45 bg-white/70" />
                <div className="h-[2px] flex-1 rounded-full" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.6) 100%)" }} />
              </div>
              <p className="mt-1.5 text-right text-[10px] font-medium italic tracking-[0.2em] text-white/90 lg:text-xs">Est. 2026</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm text-white/40 lg:text-base">AI-powered ads, media & brand storytelling.</p>
        </div>

        {/* Horizontal video cards — landscape 16:9 */}
        <div className="mb-4 flex gap-4 overflow-x-auto px-6 scrollbar-hide">
          {["/videos/v1.mov", "/videos/v2.mov", "/videos/v1.mov", "/videos/v2.mov"].map((src, i) => (
            <div key={i} className="relative aspect-video h-44 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 lg:h-56">
              <video autoPlay muted loop playsInline className="h-full w-full object-cover">
                <source src={src} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>

        {/* Vertical video cards — portrait 9:16 */}
        <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide">
          {["/videos/v2.mov", "/videos/v1.mov", "/videos/v2.mov", "/videos/v1.mov", "/videos/v2.mov"].map((src, i) => (
            <div key={i} className="relative h-64 w-36 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 lg:h-80 lg:w-44">
              <video autoPlay muted loop playsInline className="h-full w-full object-cover">
                <source src={src} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>

        {/* Contact row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 px-6">
          <Link href="mailto:hello@yourailens.studio" className="group inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-all hover:text-white">
            hello@yourailens.studio
            <span className="text-white/40 transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <a href="https://instagram.com/yourailens" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-all hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @yourailens
          </a>
        </div>
      </div>

      {/* Powered by - full width */}
      <div className="overflow-hidden border-b border-white/10 px-6 py-6 lg:px-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white">Powered by</p>
        <div className="flex animate-marquee gap-8 pr-8">
          {[...AI_MODELS, ...AI_MODELS].map((model, i) => (
            <div key={`${model.name}-${i}`} className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3">
              <Image src={model.logo} alt={model.name} width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white/90">{model.name}</span>
                <span className="text-xs text-white/50">{model.version}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Our Work + Services/CTAs */}
      <div className="grid grid-cols-1 gap-0 border-b border-white/10 lg:grid-cols-[3fr_2fr]">
        {/* Our Work */}
        <div id="work" className="overflow-hidden border-b border-white/10 px-6 py-8 lg:border-b-0 lg:border-r lg:px-10">
          <h2 className="mb-1 text-lg font-semibold text-white">Our Work</h2>
          <p className="mb-4 text-sm text-white/50">Campaigns, brands, and creative projects.</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {CAROUSEL_IMAGES.map((src, i) => (
              <div key={i} className="relative h-40 w-56 flex-shrink-0 overflow-hidden rounded-xl">
                <Image src={src} alt={`Work ${i + 1}`} fill className="object-cover" sizes="224px" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto scrollbar-hide">
            {CAROUSEL_ROW2.map((src, i) => (
              <div key={i} className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-xl">
                <Image src={src} alt={`Work ${i + 7}`} fill className="object-cover" sizes="192px" />
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="px-6 py-8 lg:px-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">What we do</p>
          <ServiceDropdown />
        </div>
      </div>

      {/* Row 2: Video + Behind the scenes */}
      <div className="grid grid-cols-1 gap-0 border-b border-white/10 lg:grid-cols-2">
        {/* Video */}
        <div className="border-b border-white/10 px-6 py-8 lg:border-b-0 lg:border-r lg:px-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">See us in action</p>
          <button type="button" onClick={() => setVideoOpen(true)} className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5 text-left">
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/5 transition-colors hover:border-white/50 hover:bg-white/10">
                <div className="ml-1 h-0 w-0 border-l-[10px] border-l-white border-y-[7px] border-y-transparent" />
              </div>
            </div>
            <Image src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80" alt="Video thumbnail" fill className="object-cover opacity-60" sizes="50vw" />
          </button>
        </div>

        {/* Behind the scenes */}
        <div className="px-6 py-8 lg:px-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Behind the scenes</p>
          <div className="grid grid-cols-2 gap-3">
            {GRID_IMAGES.map((src, i) => (
              <button key={i} type="button" onClick={() => setPopupImage({ src, alt: `Behind the scenes ${i + 1}` })} className="relative aspect-[4/3] overflow-hidden rounded-xl text-left">
                <Image src={src} alt={`Behind the scenes ${i + 1}`} fill className="object-cover transition-opacity hover:opacity-90" sizes="25vw" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Testimonials + FAQ */}
      <div className="grid grid-cols-1 gap-0 border-b border-white/10 lg:grid-cols-2">
        {/* Testimonials */}
        <div className="flex flex-col gap-6 border-b border-white/10 px-6 py-8 lg:border-b-0 lg:border-r lg:px-10">
          <div className="border-l-4 border-white/30 pl-5">
            <blockquote className="text-base italic text-white/80 lg:text-lg">
              &ldquo;Yourailens Studios transformed our brand. Their AI-powered approach is the future of creative.&rdquo;
            </blockquote>
            <p className="mt-3 text-sm text-white/50">— Client, Tech Startup</p>
          </div>
          <div className="border-l-4 border-white/20 pl-5">
            <blockquote className="text-base italic text-white/70 lg:text-lg">
              &ldquo;From concept to campaign in record time. The team gets it.&rdquo;
            </blockquote>
            <p className="mt-3 text-sm text-white/50">— Marketing Director, Fortune 500</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="px-6 py-8 lg:px-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">FAQ</p>
          <FAQAccordion />
        </div>
      </div>

      {/* Row 4: Newsletter + Bottom CTA */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        <div className="border-b border-white/10 px-6 py-8 lg:border-b-0 lg:border-r lg:px-10">
          <p className="mb-1 text-sm font-semibold text-white">Stay in the loop</p>
          <p className="mb-4 text-sm text-white/50">Get insights on AI, creativity, and brand building.</p>
          <div className="flex gap-3">
            <input type="email" placeholder="your@email.com" className="flex-1 rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none" />
            <button type="button" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90">Subscribe</button>
          </div>
        </div>
        <div className="flex flex-col justify-center px-6 py-8 lg:px-10">
          <p className="mb-3 text-white/60">Ready to create something remarkable?</p>
          <button type="button" onClick={() => setContactOpen(true)} className="inline-flex items-center gap-2 font-semibold text-white transition-opacity hover:opacity-80">
            Let&apos;s talk <span>→</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
      {popupImage && (
        <ImagePopup
          src={popupImage.src}
          alt={popupImage.alt}
          isOpen={!!popupImage}
          onClose={() => setPopupImage(null)}
        />
      )}
    </div>
  );
}
