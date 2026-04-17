"use client";

import { useEffect } from "react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden />
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:text-slate-700" aria-label="Close">✕</button>
        <h3 className="mb-1 text-2xl font-bold text-slate-900">Book a free call</h3>
        <p className="mb-6 text-sm text-slate-700">Tell us about your project — we&apos;ll respond within 24 hours.</p>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <input type="text" placeholder="Your name" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <input type="email" placeholder="Email address" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <textarea placeholder="Tell us about your project..." rows={4} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700">Send request</button>
        </form>
      </div>
    </div>
  );
}
