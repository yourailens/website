"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import type { Prompt } from "@/data/prompts";
import {
  DIFFICULTY_LABELS,
  difficultyAccent,
  promptCategoryLabel,
  promptMediaAccent,
} from "@/data/prompts";

// ── Markdown-like body renderer ──────────────────────────────
// We render the body as structured content without a heavy dep.
// Supports: # ## ###, ``` code blocks ```, > blockquote, - list, **bold**, `inline code`

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldPattern = /\*\*(.*?)\*\*/g;
  const codePattern = /`([^`]+)`/g;

  let combined = text;
  const segments: { type: "text" | "bold" | "code"; val: string }[] = [];
  let last = 0;
  const rx = /\*\*(.*?)\*\*|`([^`]+)`/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: "text", val: text.slice(last, m.index) });
    if (m[1] !== undefined) segments.push({ type: "bold", val: m[1] });
    else if (m[2] !== undefined) segments.push({ type: "code", val: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ type: "text", val: text.slice(last) });

  return segments.map((s, i) => {
    if (s.type === "bold") return <strong key={i} className="font-bold text-slate-900">{s.val}</strong>;
    if (s.type === "code") return (
      <code key={i} className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[0.82em] text-blue-700">
        {s.val}
      </code>
    );
    return s.val;
  });
}

function BodyRenderer({ body }: { body: string }) {
  const lines = body.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const block: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        block.push(lines[i]);
        i++;
      }
      nodes.push(
        <div key={`code-${i}`} className="group relative my-6 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#0f172a]">
          {lang && (
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">{lang}</span>
              <CopyButton text={block.join("\n")} />
            </div>
          )}
          <pre className="max-w-full overflow-x-auto p-5 text-[13px] leading-relaxed text-slate-200">
            <code className="whitespace-pre">{block.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${i}`} className="mt-10 mb-4 font-heading text-3xl font-black leading-tight tracking-tight text-slate-900 first:mt-0">
          {renderInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${i}`} className="mt-8 mb-3 flex items-center gap-3 font-heading text-xl font-black tracking-tight text-slate-900">
          <span className="h-1 w-6 rounded-full bg-blue-500 shrink-0" />
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${i}`} className="mt-6 mb-2 font-heading text-base font-bold text-slate-800">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const bqLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <blockquote key={`bq-${i}`} className="my-5 border-l-4 border-blue-500 bg-blue-50/60 px-5 py-4 text-sm leading-relaxed text-slate-700 italic rounded-r-xl">
          {bqLines.map((l, li) => <p key={li}>{renderInline(l)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2">
          {items.map((item, li) => (
            <li key={li} className="flex gap-3 text-sm leading-relaxed text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2">
          {items.map((item, li) => (
            <li key={li} className="flex gap-3 text-sm leading-relaxed text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {li + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Inline image: ![caption](url)
    if (/^!\[.*?\]\(.+?\)/.test(line.trim())) {
      const m = line.trim().match(/^!\[(.*?)\]\((.+?)\)/);
      if (m) {
        const [, caption, url] = m;
        nodes.push(
          <figure key={`img-${i}`} className="my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={caption}
              className="w-full rounded-2xl border border-slate-200 object-contain shadow-md"
              loading="lazy"
            />
            {caption && (
              <figcaption className="mt-2 text-center text-xs text-slate-400 italic">{caption}</figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }
    }

    // Inline video: [video](url "caption") or [video](url)
    if (/^\[video\]\(.+?\)/.test(line.trim())) {
      const m = line.trim().match(/^\[video\]\((.+?)(?:\s+"(.*?)")?\)/);
      if (m) {
        const [, url, caption] = m;
        nodes.push(
          <figure key={`vid-${i}`} className="my-6">
            <video
              src={url}
              controls
              playsInline
              className="w-full rounded-2xl border border-slate-200 shadow-md"
            />
            {caption && (
              <figcaption className="mt-2 text-center text-xs text-slate-400 italic">{caption}</figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }
    }

    // Horizontal rule
    if (line.trim() === "---") {
      nodes.push(<hr key={`hr-${i}`} className="my-8 border-slate-200" />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    nodes.push(
      <p key={`p-${i}`} className="mb-4 text-[15px] leading-[1.8] text-slate-700">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="prose-custom min-w-0 break-words">{nodes}</div>;
}

// ── Copy button ───────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="rounded-md px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:text-white"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Related card ─────────────────────────────────────────────

function RelatedCard({ p }: { p: Prompt }) {
  const accent = promptMediaAccent(p.media_type);
  return (
    <Link
      href={`/prompts/${p.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {p.cover_image_url ? (
          <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-slate-300">
              <path d="M12 2L19 6V12C19 15.87 15.87 20.27 12 21C8.13 20.27 5 15.87 5 12V6L12 2Z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <span className={`inline-flex items-center gap-1 rounded-full border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${accent.bg} ${accent.text} ${accent.border}`}>
          {p.media_type}
        </span>
        <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-800 group-hover:text-blue-700">
          {p.title}
        </p>
      </div>
    </Link>
  );
}

// ── Main ─────────────────────────────────────────────────────

export default function PromptDetailExperience({
  prompt,
  related,
}: {
  prompt: Prompt;
  related: Prompt[];
}) {
  const accent = promptMediaAccent(prompt.media_type);
  const diff = difficultyAccent(prompt.difficulty);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [readPct, setReadPct] = useState(0);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height;
      const scrolled = -rect.top;
      setReadPct(Math.min(100, Math.max(0, (scrolled / (total - window.innerHeight)) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <Navbar />
    {/* Back bar */}
    <div className="border-b border-slate-200 bg-white">
      <div className="w-[95%] mx-auto py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/prompts"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Workflows
          </Link>
          <span className="min-w-0 truncate text-xs font-semibold text-slate-500">{prompt.title}</span>
        </div>
      </div>
    </div>
    <div ref={scrollRef}>
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-100"
          style={{ width: `${readPct}%` }}
        />
      </div>

      {/* ── Cover ── */}
      {prompt.cover_image_url && (
        <>
          {prompt.cover_aspect === "portrait" || prompt.cover_aspect === "square" ? (
            /* Portrait / square — blurred bg + centred card */
            <div className="relative w-full overflow-hidden flex justify-center py-8">
              <Image
                src={prompt.cover_image_url}
                alt=""
                fill
                aria-hidden
                sizes="100vw"
                className="object-cover scale-110"
                style={{ filter: "blur(28px) brightness(0.55) saturate(1.2)" }}
                unoptimized
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className={`relative z-10 overflow-hidden rounded-2xl shadow-2xl ${
                prompt.cover_aspect === "portrait" ? "h-[60vh] w-[min(340px,80vw)]" : "h-[min(60vh,500px)] w-[min(60vh,500px)]"
              }`}>
                <Image
                  src={prompt.cover_image_url}
                  alt={prompt.title}
                  fill
                  priority
                  sizes="500px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ) : (
            /* Landscape — show full image at natural aspect ratio, no crop */
            <div className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={prompt.cover_image_url}
                alt={prompt.title}
                className="w-full h-auto block"
              />
            </div>
          )}
        </>
      )}

      <main className="mx-auto max-w-7xl overflow-hidden px-6 lg:px-10">
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-14">
          {/* ── Left: main content ── */}
          <div className="min-w-0">

            {/* Meta badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${accent.bg} ${accent.text} ${accent.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                {prompt.media_type}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {promptCategoryLabel(prompt)}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${diff.bg} ${diff.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
                {DIFFICULTY_LABELS[prompt.difficulty]}
              </span>
            </div>

            {/* Title */}
            <h1
              className="mt-5 font-heading font-black leading-[1.05] tracking-tight text-slate-900 break-words"
              style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)", letterSpacing: "-0.025em" }}
            >
              {prompt.title}
            </h1>
            {prompt.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-slate-500">{prompt.excerpt}</p>
            )}

            {/* Stats row */}
            <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-6 text-xs text-slate-400">
              <span>
                {new Date(prompt.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {prompt.view_count > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span>{prompt.view_count.toLocaleString()} views</span>
                </>
              )}
            </div>

            {/* Demo video */}
            {prompt.demo_video_url && (
              <div className="my-8">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Demo video</p>
                <video
                  src={prompt.demo_video_url}
                  controls
                  playsInline
                  muted
                  preload="metadata"
                  className="w-full rounded-2xl bg-black shadow-lg"
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            )}

            {/* Body */}
            <div className="py-10">
              <BodyRenderer body={prompt.body} />
            </div>

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div className="mt-2 border-t border-slate-100 pt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related (mobile only) */}
            {related.length > 0 && (
              <div className="mt-12 border-t border-slate-100 pt-8 lg:hidden">
                <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
                  More workflows
                </p>
                <div className="space-y-4">
                  {related.map((r) => <RelatedCard key={r.id} p={r} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-6 pt-8">
              {/* Models */}
              {prompt.models.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
                    AI Models Used
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.models.map((m) => (
                      <span key={m} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags sidebar */}
              {prompt.tags.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related */}
              {related.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
                    More workflows
                  </p>
                  <div className="space-y-4">
                    {related.map((r) => <RelatedCard key={r.id} p={r} />)}
                  </div>
                  <Link
                    href="/prompts"
                    className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                  >
                    Browse all prompts
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              )}

              {/* Back CTA */}
              <Link
                href="/prompts"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
              >
                ← Back to Prompt Library
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </>
  );
}
