"use client";

import Image from "next/image";
import { useEffect } from "react";

interface ImagePopupProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePopup({ src, alt, isOpen, onClose }: ImagePopupProps) {
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
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        aria-hidden
      />
      <div
        className="relative max-h-[90vh] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white"
          aria-label="Close"
        >
          Close ✕
        </button>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="90vw"
          />
        </div>
      </div>
    </div>
  );
}
