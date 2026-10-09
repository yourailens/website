import type { CSSProperties } from "react";

/** CSS aspect-ratio string from pixel size. Falls back to landscape when unknown. */
export function aspectRatioCss(width?: number | null, height?: number | null): string {
  const w = width && width > 0 ? width : 16;
  const h = height && height > 0 ? height : 9;
  return `${w} / ${h}`;
}

/**
 * Stage shell styles that honor any ratio without blowing past the viewport.
 * Landscape → full width; portrait / square → capped width so height stays usable.
 */
export function vaultStageShellStyle(width?: number | null, height?: number | null): CSSProperties {
  const ratio = width && height && width > 0 && height > 0 ? width / height : 16 / 9;
  const portrait = ratio < 0.95;
  return {
    aspectRatio: aspectRatioCss(width, height),
    width: "100%",
    maxHeight: "min(85vh, 56rem)",
    maxWidth: portrait ? `min(100%, calc(min(85vh, 56rem) * ${ratio}))` : "100%",
    marginInline: "auto",
  };
}
