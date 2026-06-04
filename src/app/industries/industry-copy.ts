/** Display copy without em/en dashes (site style avoids — on public pages) */
export function plainCopy(text: string | null | undefined): string {
  if (!text?.trim()) return "";
  return text
    .trim()
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ");
}

/** Client-facing headlines (admin copy may or may not end with ?) */
export function clientHeadline(text: string | null | undefined, fallback: string): string {
  return plainCopy(text?.trim() || fallback);
}

/** Eyebrow line: "Label, context" (no middle dots or dashes) */
export function industryEyebrow(label: string, context?: string): string {
  const a = plainCopy(label);
  const b = context ? plainCopy(context) : "";
  return b ? `${a}, ${b}` : a;
}
