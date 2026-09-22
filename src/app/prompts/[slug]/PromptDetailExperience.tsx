"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  INDUSTRY_PAGE,
  IndustryBreadcrumb,
  IndustryPrimaryLink,
  IndustryShell,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";
import type { Prompt } from "@/data/prompts";
import {
  DIFFICULTY_LABELS,
  promptCategoryLabel,
} from "@/data/prompts";

function renderInline(text: string): React.ReactNode[] {
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
    if (s.type === "bold") return <strong key={i} className="font-semibold text-white">{s.val}</strong>;
    if (s.type === "code")
      return (
        <code
          key={i}
          className="border border-blue-400/30 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[0.82em] text-blue-200"
        >
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

    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const block: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        block.push(lines[i]);
        i++;
      }
      nodes.push(
        <div
          key={`code-${i}`}
          className="group relative my-6 max-w-full overflow-hidden border border-white/12 bg-black"
        >
          {lang && (
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
                {lang}
              </span>
              <CopyButton text={block.join("\n")} />
            </div>
          )}
          <pre className="max-w-full overflow-x-auto p-5 text-[13px] leading-relaxed text-white/75">
            <code className="whitespace-pre">{block.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h1
          key={`h1-${i}`}
          className="mb-4 mt-10 font-body text-3xl font-semibold leading-tight tracking-tight text-white first:mt-0"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2
          key={`h2-${i}`}
          className="mb-3 mt-8 flex items-center gap-3 font-body text-xl font-semibold tracking-tight text-white"
        >
          <span className="h-1 w-6 shrink-0 bg-blue-400" />
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${i}`} className="mb-2 mt-6 font-body text-base font-semibold text-white/90">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const bqLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <blockquote
          key={`bq-${i}`}
          className="my-5 border-l-2 border-blue-400 bg-blue-500/10 px-5 py-4 text-sm italic leading-relaxed text-white/65"
        >
          {bqLines.map((l, li) => (
            <p key={li}>{renderInline(l)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2">
          {items.map((item, li) => (
            <li key={li} className="flex gap-3 text-sm leading-relaxed text-white/65">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2">
          {items.map((item, li) => (
            <li key={li} className="flex gap-3 text-sm leading-relaxed text-white/65">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-blue-400/50 bg-blue-500/15 text-[10px] font-bold text-blue-200">
                {li + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^!\[.*?\]\(.+?\)/.test(line.trim())) {
      const match = line.trim().match(/^!\[(.*?)\]\((.+?)\)/);
      if (match) {
        const [, caption, url] = match;
        nodes.push(
          <figure key={`img-${i}`} className="my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={caption}
              className="w-full border border-white/12 object-contain"
              loading="lazy"
            />
            {caption && (
              <figcaption className="mt-2 text-center text-xs italic text-white/40">{caption}</figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }
    }

    if (/^\[video\]\(.+?\)/.test(line.trim())) {
      const match = line.trim().match(/^\[video\]\((.+?)(?:\s+"(.*?)")?\)/);
      if (match) {
        const [, url, caption] = match;
        nodes.push(
          <figure key={`vid-${i}`} className="my-6">
            <video src={url} controls playsInline className="w-full border border-white/12 bg-black" />
            {caption && (
              <figcaption className="mt-2 text-center text-xs italic text-white/40">{caption}</figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }
    }

    if (line.trim() === "---") {
      nodes.push(<hr key={`hr-${i}`} className="my-8 border-white/10" />);
      i++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    nodes.push(
      <p key={`p-${i}`} className="mb-4 text-[15px] leading-[1.8] text-white/65">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="prose-custom min-w-0 break-words">{nodes}</div>;
}

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
      className="px-2 py-1 text-[10px] font-semibold text-white/40 transition hover:text-blue-300"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function RelatedCard({ p }: { p: Prompt }) {
  return (
    <Link
      href={`/prompts/${p.slug}`}
      className="group flex items-start gap-4 border border-white/12 bg-white/[0.02] p-4 transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-white/10 bg-black">
        {p.cover_image_url ? (
          <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              className="text-white/25"
            >
              <path d="M12 2L19 6V12C19 15.87 15.87 20.27 12 21C8.13 20.27 5 15.87 5 12V6L12 2Z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <span className="inline-flex items-center border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-200">
          {p.media_type}
        </span>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-blue-100">
          {p.title}
        </p>
      </div>
    </Link>
  );
}

const pill =
  "border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/55";

export default function PromptDetailExperience({
  prompt,
  related,
}: {
  prompt: Prompt;
  related: Prompt[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [readPct, setReadPct] = useState(0);

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
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "WORKFLOWS", href: "/prompts" },
            { label: prompt.title.toUpperCase(), current: true },
          ]}
        />
      </IndustryTopBar>

      <div ref={scrollRef}>
        <div className="fixed left-0 right-0 top-0 z-[60] h-[3px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-100"
            style={{ width: `${readPct}%` }}
          />
        </div>

        {prompt.cover_image_url && (
          <>
            {prompt.cover_aspect === "portrait" || prompt.cover_aspect === "square" ? (
              <div className="relative flex w-full justify-center overflow-hidden py-8">
                <Image
                  src={prompt.cover_image_url}
                  alt=""
                  fill
                  aria-hidden
                  sizes="100vw"
                  className="scale-110 object-cover"
                  style={{ filter: "blur(28px) brightness(0.35) saturate(1.2)" }}
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40" />
                <div
                  className={`relative z-10 overflow-hidden border border-white/12 shadow-2xl ${
                    prompt.cover_aspect === "portrait"
                      ? "h-[60vh] w-[min(340px,80vw)]"
                      : "h-[min(60vh,500px)] w-[min(60vh,500px)]"
                  }`}
                >
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
              <div className="w-full border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={prompt.cover_image_url} alt={prompt.title} className="block h-auto w-full" />
              </div>
            )}
          </>
        )}

        <main className={`${INDUSTRY_PAGE} overflow-hidden pb-20`}>
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-14">
            <div className="min-w-0">
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-blue-400/40 bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200">
                  {prompt.media_type}
                </span>
                <span className={pill}>{promptCategoryLabel(prompt)}</span>
                <span className={pill}>{DIFFICULTY_LABELS[prompt.difficulty]}</span>
              </div>

              <h1
                className="mt-5 break-words font-body font-semibold leading-[1.05] tracking-tight text-white"
                style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)", letterSpacing: "-0.025em" }}
              >
                {prompt.title}
              </h1>
              {prompt.excerpt && (
                <p className="mt-4 text-lg font-light leading-relaxed text-white/55">{prompt.excerpt}</p>
              )}

              <div className="mt-6 flex items-center gap-4 border-b border-white/10 pb-6 text-xs text-white/40">
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

              {prompt.demo_video_url && (
                <div className="my-8">
                  <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                    Demo video
                  </p>
                  <video
                    src={prompt.demo_video_url}
                    controls
                    playsInline
                    muted
                    preload="metadata"
                    className="w-full border border-white/12 bg-black"
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              )}

              <div className="py-10">
                <BodyRenderer body={prompt.body} />
              </div>

              {prompt.tags.length > 0 && (
                <div className="mt-2 border-t border-white/10 pt-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/35">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-white/12 bg-white/[0.02] px-3 py-1 text-xs font-medium text-white/55"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div className="mt-12 border-t border-white/10 pt-8 lg:hidden">
                  <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                    More workflows
                  </p>
                  <div className="space-y-4">
                    {related.map((r) => (
                      <RelatedCard key={r.id} p={r} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-32 space-y-6 pt-8">
                {prompt.models.length > 0 && (
                  <div className="border border-white/12 bg-white/[0.02] p-5">
                    <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                      AI Models Used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {prompt.models.map((m) => (
                        <span
                          key={m}
                          className="border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {prompt.tags.length > 0 && (
                  <div className="border border-white/12 bg-white/[0.02] p-5">
                    <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/55"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {related.length > 0 && (
                  <div className="border border-white/12 bg-white/[0.02] p-5">
                    <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                      More workflows
                    </p>
                    <div className="space-y-4">
                      {related.map((r) => (
                        <RelatedCard key={r.id} p={r} />
                      ))}
                    </div>
                    <div className="mt-5">
                      <IndustryPrimaryLink href="/prompts">Browse all prompts</IndustryPrimaryLink>
                    </div>
                  </div>
                )}

                <IndustryPrimaryLink href="/prompts">← Back to Prompt Library</IndustryPrimaryLink>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </IndustryShell>
  );
}
