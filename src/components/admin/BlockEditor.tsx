"use client";

import { useEffect, useRef, useState } from "react";

// ── Block types ───────────────────────────────────────────────

export type Block =
  | { id: string; type: "heading1"; text: string }
  | { id: string; type: "heading2"; text: string }
  | { id: string; type: "heading3"; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "code"; lang: string; code: string }
  | { id: string; type: "blockquote"; text: string }
  | { id: string; type: "bullet_list"; items: string[] }
  | { id: string; type: "numbered_list"; items: string[] }
  | { id: string; type: "image"; url: string; caption: string }
  | { id: string; type: "video"; url: string; caption: string }
  | { id: string; type: "divider" };

let _uid = 0;
function uid() { return `b${++_uid}`; }

// ── Markdown serialiser / deserialiser ────────────────────────

export function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "heading1":      return `# ${b.text}`;
        case "heading2":      return `## ${b.text}`;
        case "heading3":      return `### ${b.text}`;
        case "paragraph":     return b.text;
        case "code":          return `\`\`\`${b.lang}\n${b.code}\n\`\`\``;
        case "blockquote":    return b.text.split("\n").map((l) => `> ${l}`).join("\n");
        case "bullet_list":   return b.items.map((i) => `- ${i}`).join("\n");
        case "numbered_list": return b.items.map((i, n) => `${n + 1}. ${i}`).join("\n");
        case "image":         return `![${b.caption}](${b.url})`;
        case "video":         return b.caption ? `[video](${b.url} "${b.caption}")` : `[video](${b.url})`;
        case "divider":       return "---";
      }
    })
    .join("\n\n");
}

export function markdownToBlocks(md: string): Block[] {
  if (!md.trim()) return [];
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) { code.push(lines[i]); i++; }
      blocks.push({ id: uid(), type: "code", lang, code: code.join("\n") });
      i++; continue;
    }
    if (line.startsWith("# "))  { blocks.push({ id: uid(), type: "heading1", text: line.slice(2) }); i++; continue; }
    if (line.startsWith("## ")) { blocks.push({ id: uid(), type: "heading2", text: line.slice(3) }); i++; continue; }
    if (line.startsWith("### ")){ blocks.push({ id: uid(), type: "heading3", text: line.slice(4) }); i++; continue; }
    if (line.trim() === "---")  { blocks.push({ id: uid(), type: "divider" }); i++; continue; }

    if (line.startsWith("> ")) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { bqLines.push(lines[i].slice(2)); i++; }
      blocks.push({ id: uid(), type: "blockquote", text: bqLines.join("\n") }); continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { items.push(lines[i].slice(2)); i++; }
      blocks.push({ id: uid(), type: "bullet_list", items }); continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      blocks.push({ id: uid(), type: "numbered_list", items }); continue;
    }

    // image: ![caption](url)
    if (/^!\[.*?\]\(.+?\)/.test(line.trim())) {
      const m = line.trim().match(/^!\[(.*?)\]\((.+?)\)/);
      if (m) { blocks.push({ id: uid(), type: "image", caption: m[1], url: m[2] }); i++; continue; }
    }

    // video: [video](url "caption") or [video](url)
    if (/^\[video\]\(.+?\)/.test(line.trim())) {
      const m = line.trim().match(/^\[video\]\((.+?)(?:\s+"(.*?)")?\)/);
      if (m) { blocks.push({ id: uid(), type: "video", url: m[1], caption: m[2] ?? "" }); i++; continue; }
    }

    if (line.trim() === "") { i++; continue; }

    blocks.push({ id: uid(), type: "paragraph", text: line });
    i++;
  }
  return blocks;
}

// ── Toolbar config ────────────────────────────────────────────

type ToolbarItem = {
  type: Block["type"];
  label: string;
  icon: React.ReactNode;
  isCode?: boolean;
};

const TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    type: "heading1",
    label: "H1",
    icon: (
      <span className="font-mono text-[11px] font-black">H1</span>
    ),
  },
  {
    type: "heading2",
    label: "H2",
    icon: <span className="font-mono text-[11px] font-black">H2</span>,
  },
  {
    type: "heading3",
    label: "H3",
    icon: <span className="font-mono text-[11px] font-black">H3</span>,
  },
  {
    type: "paragraph",
    label: "Text",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 3h12v2H9v8H7V5H2V3z"/>
      </svg>
    ),
  },
  {
    type: "bullet_list",
    label: "List",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="2.5" cy="4.5" r="1.5"/>
        <circle cx="2.5" cy="8.5" r="1.5"/>
        <circle cx="2.5" cy="12.5" r="1.5"/>
        <rect x="5.5" y="3.5" width="9" height="2" rx="1"/>
        <rect x="5.5" y="7.5" width="9" height="2" rx="1"/>
        <rect x="5.5" y="11.5" width="9" height="2" rx="1"/>
      </svg>
    ),
  },
  {
    type: "numbered_list",
    label: "Steps",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <text x="0" y="6" fontSize="6" fontWeight="bold" fontFamily="monospace">1.</text>
        <text x="0" y="11" fontSize="6" fontWeight="bold" fontFamily="monospace">2.</text>
        <rect x="6" y="3.5" width="9" height="2" rx="1"/>
        <rect x="6" y="8.5" width="9" height="2" rx="1"/>
      </svg>
    ),
  },
  {
    type: "blockquote",
    label: "Tip",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2h1.5v5.5c0 1.5-.8 2.5-2 3l-.5-1c.8-.4 1-1 1-2V2zm5.5 0H10v5.5c0 1.5-.8 2.5-2 3l-.5-1c.8-.4 1-1 1-2V2z"/>
      </svg>
    ),
  },
  {
    type: "code",
    label: "Code",
    isCode: true,
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.5 3.5L1 8l4.5 4.5 1-1L3 8l3.5-3.5-1-1zM10.5 3.5l-1 1L13 8l-3.5 3.5 1 1L15 8l-4.5-4.5z"/>
      </svg>
    ),
  },
  {
    type: "image",
    label: "Image",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="2" width="14" height="12" rx="2" fillOpacity=".15" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <circle cx="5" cy="6" r="1.2"/><polyline points="1,12 5,8 8,11 11,8 15,12" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
  {
    type: "video",
    label: "Video",
    isCode: true,
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="3" width="10" height="10" rx="1.5" fillOpacity=".2"/><polygon points="15,8 11,5 11,11"/>
      </svg>
    ),
  },
  {
    type: "divider",
    label: "Line",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="7" width="14" height="2" rx="1"/>
      </svg>
    ),
  },
];

function defaultBlock(type: Block["type"]): Block {
  switch (type) {
    case "heading1":      return { id: uid(), type, text: "" };
    case "heading2":      return { id: uid(), type, text: "" };
    case "heading3":      return { id: uid(), type, text: "" };
    case "paragraph":     return { id: uid(), type, text: "" };
    case "code":          return { id: uid(), type: "code", lang: "prompt", code: "" };
    case "blockquote":    return { id: uid(), type, text: "" };
    case "bullet_list":   return { id: uid(), type, items: [""] };
    case "numbered_list": return { id: uid(), type, items: [""] };
    case "image":         return { id: uid(), type: "image", url: "", caption: "" };
    case "video":         return { id: uid(), type: "video", url: "", caption: "" };
    case "divider":       return { id: uid(), type: "divider" };
  }
}

// ── Inline toolbar (appears between blocks on hover) ──────────

function InlineToolbar({ onAdd }: { onAdd: (type: Block["type"]) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white px-1.5 py-1 shadow-md">
      {TOOLBAR_ITEMS.map((item) => (
        <button
          key={item.type}
          type="button"
          title={item.label}
          onMouseDown={(e) => { e.preventDefault(); onAdd(item.type); }}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
            item.isCode
              ? "bg-slate-900 text-slate-200 hover:bg-slate-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

// ── Main toolbar (always visible at bottom) ───────────────────

function MainToolbar({ onAdd }: { onAdd: (type: Block["type"]) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 select-none shrink-0">
        Add block
      </span>
      <div className="mx-1 h-3 w-px bg-slate-200 shrink-0" />
      {TOOLBAR_ITEMS.map((item) => (
        <button
          key={item.type}
          type="button"
          onClick={() => onAdd(item.type)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            item.isCode
              ? "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-700 hover:text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 shadow-sm"
          }`}
        >
          <span className="flex items-center justify-center">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── Auto-growing textarea ─────────────────────────────────────

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none overflow-hidden bg-transparent outline-none ${className}`}
    />
  );
}

// ── Media upload field (used by image + video blocks) ─────────

async function uploadMediaFile(file: File, path: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", `body-${Date.now()}`);
  const res = await fetch(path, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json() as { url?: string };
  if (!json.url) throw new Error("No URL returned");
  return json.url;
}

function MediaUploadField({
  type,
  url,
  caption,
  onUrlChange,
  onCaptionChange,
  uploadPath,
}: {
  type: "image" | "video";
  url: string;
  caption: string;
  onUrlChange: (url: string) => void;
  onCaptionChange: (caption: string) => void;
  uploadPath: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const isImage = type === "image";

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const newUrl = await uploadMediaFile(file, uploadPath);
      onUrlChange(newUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* Upload / preview area */}
      <div
        className={`relative cursor-pointer transition ${
          isImage ? "bg-slate-50 hover:bg-slate-100" : "bg-[#0a0f1e] hover:bg-[#111827]"
        }`}
        onClick={() => !url && inputRef.current?.click()}
      >
        {url ? (
          isImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={caption} className="max-h-[50vh] w-full object-contain" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="absolute right-2 top-2 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow hover:bg-white"
              >
                Replace
              </button>
            </div>
          ) : (
            <div className="relative p-3">
              <video src={url} controls playsInline className="w-full rounded-xl" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="absolute right-4 top-4 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20"
              >
                Replace
              </button>
            </div>
          )
        ) : (
          <div
            className={`flex flex-col items-center justify-center gap-2 py-10 ${isImage ? "text-slate-400" : "text-slate-500"}`}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <span className={`h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${isImage ? "border-slate-400" : "border-slate-500"}`} />
            ) : (
              <>
                {isImage ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                )}
                <p className="text-sm font-semibold">Click to upload {isImage ? "image" : "video"}</p>
                <p className="text-xs opacity-60">{isImage ? "PNG, JPG, WebP" : "MP4, WebM, MOV"}</p>
              </>
            )}
            {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={isImage ? "image/*" : "video/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {/* Caption + URL row */}
      <div className={`flex items-center gap-3 px-4 py-2.5 ${isImage ? "border-t border-slate-200" : "border-t border-white/10"}`}>
        <input
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Caption (optional)"
          className={`flex-1 bg-transparent text-xs outline-none placeholder:opacity-50 ${isImage ? "text-slate-700" : "text-slate-300"}`}
        />
        {url && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`shrink-0 text-[10px] font-bold transition ${isImage ? "text-slate-400 hover:text-blue-600" : "text-slate-500 hover:text-white"}`}
          >
            {uploading ? "Uploading…" : "↑ Replace"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Block row controls (move up/down + delete) ────────────────

function BlockControls({
  visible,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  visible: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <button type="button" title="Move up" disabled={isFirst} onClick={onMoveUp}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] text-slate-400 shadow-sm hover:text-blue-600 disabled:opacity-25">↑</button>
      <button type="button" title="Move down" disabled={isLast} onClick={onMoveDown}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] text-slate-400 shadow-sm hover:text-blue-600 disabled:opacity-25">↓</button>
      <button type="button" title="Delete" onClick={onDelete}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-red-100 bg-white text-[10px] text-slate-300 shadow-sm hover:border-red-200 hover:text-red-500">✕</button>
    </div>
  );
}

// ── Individual block editors ──────────────────────────────────

function BlockField({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const showControls = hovered || focused;

  const wrap = (label: string, children: React.ReactNode) => (
    <div
      className="group relative pr-9 rounded-xl border border-transparent p-3 transition-all hover:border-slate-200 hover:bg-white focus-within:border-blue-200 focus-within:bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 select-none">{label}</p>
      {children}
      <BlockControls
        visible={showControls}
        isFirst={isFirst}
        isLast={isLast}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
      />
    </div>
  );

  switch (block.type) {
    case "heading1":
      return wrap("Heading 1", (
        <AutoTextarea value={block.text} onChange={(v) => onChange({ ...block, text: v })}
          placeholder="Section title…"
          className="font-heading text-2xl font-black leading-tight tracking-tight text-slate-900 placeholder:text-slate-300" />
      ));

    case "heading2":
      return wrap("Heading 2", (
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded-full bg-blue-500 shrink-0" />
          <AutoTextarea value={block.text} onChange={(v) => onChange({ ...block, text: v })}
            placeholder="Sub-section…"
            className="font-heading text-lg font-black tracking-tight text-slate-900 placeholder:text-slate-300" />
        </div>
      ));

    case "heading3":
      return wrap("Heading 3", (
        <AutoTextarea value={block.text} onChange={(v) => onChange({ ...block, text: v })}
          placeholder="Step label…"
          className="font-heading text-base font-bold text-slate-800 placeholder:text-slate-300" />
      ));

    case "paragraph":
      return wrap("Paragraph", (
        <AutoTextarea value={block.text} onChange={(v) => onChange({ ...block, text: v })}
          placeholder="Write something… (supports **bold** and `code`)"
          className="text-sm leading-[1.8] text-slate-700 placeholder:text-slate-300" />
      ));

    case "code":
      return (
        <div
          className="group relative pr-9 overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {/* Code block header bar */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-2.5">
            {/* traffic light dots */}
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            </span>
            <div className="mx-1 h-3 w-px bg-white/10" />
            <input
              value={block.lang}
              onChange={(e) => onChange({ ...block, lang: e.target.value })}
              placeholder="language (e.g. prompt, python, bash)"
              className="flex-1 bg-transparent font-mono text-[11px] text-slate-400 outline-none placeholder:text-slate-600"
            />
            <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {block.lang || "code"}
            </span>
          </div>

          {/* Code textarea */}
          <textarea
            value={block.code}
            onChange={(e) => onChange({ ...block, code: e.target.value })}
            rows={Math.max(4, block.code.split("\n").length + 1)}
            placeholder="Paste your prompt, code, or command here…"
            className="w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-slate-200 outline-none placeholder:text-slate-600"
          />

          <div
            className={`absolute right-2 top-2 flex flex-col gap-0.5 transition-opacity ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <button type="button" title="Move up" disabled={isFirst} onClick={onMoveUp}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/10 text-[10px] text-slate-400 hover:text-white disabled:opacity-25">↑</button>
            <button type="button" title="Move down" disabled={isLast} onClick={onMoveDown}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/10 text-[10px] text-slate-400 hover:text-white disabled:opacity-25">↓</button>
            <button type="button" title="Delete" onClick={onDelete}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-red-900/40 bg-white/10 text-[10px] text-slate-500 hover:text-red-400">✕</button>
          </div>
        </div>
      );

    case "blockquote":
      return (
        <div
          className="group relative pr-9 rounded-r-xl border-l-4 border-blue-500 bg-blue-50/60 px-5 py-4"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-blue-300 select-none">Pro tip / Note</p>
          <AutoTextarea value={block.text} onChange={(v) => onChange({ ...block, text: v })}
            placeholder="Add a pro tip, warning, or note…"
            className="text-sm italic leading-relaxed text-slate-700 placeholder:text-blue-200" />
          <BlockControls
            visible={showControls}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        </div>
      );

    case "bullet_list":
      return (
        <div
          className="group relative pr-9 rounded-xl border border-transparent p-3 transition-all hover:border-slate-200 hover:bg-white focus-within:border-blue-200 focus-within:bg-white"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 select-none">Bullet list</p>
          <div className="space-y-1.5">
            {block.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <input
                  value={item}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = e.target.value;
                    onChange({ ...block, items });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const items = [...block.items];
                      items.splice(idx + 1, 0, "");
                      onChange({ ...block, items });
                    }
                    if (e.key === "Backspace" && item === "" && block.items.length > 1) {
                      e.preventDefault();
                      onChange({ ...block, items: block.items.filter((_, i) => i !== idx) });
                    }
                  }}
                  placeholder="List item… (Enter adds next, Backspace removes)"
                  className="flex-1 bg-transparent text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ""] })}
            className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-blue-600">
            <span className="text-base leading-none">+</span> Add item
          </button>
          <BlockControls
            visible={showControls}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        </div>
      );

    case "numbered_list":
      return (
        <div
          className="group relative pr-9 rounded-xl border border-transparent p-3 transition-all hover:border-slate-200 hover:bg-white focus-within:border-blue-200 focus-within:bg-white"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 select-none">Numbered list</p>
          <div className="space-y-1.5">
            {block.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{idx + 1}</span>
                <input
                  value={item}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = e.target.value;
                    onChange({ ...block, items });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const items = [...block.items];
                      items.splice(idx + 1, 0, "");
                      onChange({ ...block, items });
                    }
                    if (e.key === "Backspace" && item === "" && block.items.length > 1) {
                      e.preventDefault();
                      onChange({ ...block, items: block.items.filter((_, i) => i !== idx) });
                    }
                  }}
                  placeholder="Step… (Enter adds next, Backspace removes)"
                  className="flex-1 bg-transparent text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ""] })}
            className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-blue-600">
            <span className="text-base leading-none">+</span> Add step
          </button>
          <BlockControls
            visible={showControls}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        </div>
      );

    case "image":
      return (
        <div
          className="group relative pr-9 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 transition focus-within:border-blue-200"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <MediaUploadField
            type="image"
            url={block.url}
            caption={block.caption}
            onUrlChange={(url) => onChange({ ...block, url })}
            onCaptionChange={(caption) => onChange({ ...block, caption })}
            uploadPath="/api/admin/prompts/upload-body-image"
          />
          <BlockControls
            visible={showControls}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        </div>
      );

    case "video":
      return (
        <div
          className="group relative pr-9 rounded-2xl border border-slate-800 overflow-hidden bg-[#0f172a] transition focus-within:border-blue-500"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <MediaUploadField
            type="video"
            url={block.url}
            caption={block.caption}
            onUrlChange={(url) => onChange({ ...block, url })}
            onCaptionChange={(caption) => onChange({ ...block, caption })}
            uploadPath="/api/admin/prompts/upload-body-video"
          />
          <BlockControls
            visible={showControls}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        </div>
      );

    case "divider":
      return (
        <div
          className="group relative pr-9 flex items-center gap-3 py-3"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <hr className="flex-1 border-slate-200" />
          <span className="shrink-0 font-mono text-[9px] text-slate-300 select-none">divider</span>
          <hr className="flex-1 border-slate-200" />
          <BlockControls
            visible={showControls}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
          />
        </div>
      );
  }
}

// ── Gap line between blocks (shows inline toolbar on hover) ───

function BlockGap({ onAdd }: { onAdd: (type: Block["type"]) => void }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex items-center py-0.5"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className={`flex w-full items-center gap-2 transition-opacity duration-150 ${show ? "opacity-100" : "opacity-0"}`}>
        <div className="flex-1 border-t border-dashed border-slate-200" />
        <InlineToolbar onAdd={(type) => { onAdd(type); setShow(false); }} />
        <div className="flex-1 border-t border-dashed border-slate-200" />
      </div>
      {!show && <div className="w-full border-t border-transparent" />}
    </div>
  );
}

// ── Main BlockEditor ──────────────────────────────────────────

export default function BlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => markdownToBlocks(value));
  const initialised = useRef(false);

  useEffect(() => {
    setBlocks(markdownToBlocks(value));
    initialised.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialised.current) return;
    onChange(blocksToMarkdown(blocks));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  function updateBlock(idx: number, b: Block) {
    setBlocks((prev) => prev.map((x, i) => (i === idx ? b : x)));
  }
  function deleteBlock(idx: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  }
  function insertBlock(afterIdx: number, type: Block["type"]) {
    const b = defaultBlock(type);
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(afterIdx + 1, 0, b);
      return next;
    });
  }
  function appendBlock(type: Block["type"]) {
    setBlocks((prev) => [...prev, defaultBlock(type)]);
  }
  function moveBlock(idx: number, dir: -1 | 1) {
    const to = idx + dir;
    if (to < 0 || to >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }

  return (
    <div className="space-y-0">
      {blocks.length === 0 && (
        <div className="mb-3 rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
          <p className="text-sm font-semibold text-slate-400">Start building your workflow</p>
          <p className="mt-1 text-xs text-slate-300">Use the toolbar below to add your first block</p>
        </div>
      )}

      {blocks.map((block, idx) => (
        <div key={block.id}>
          <BlockField
            block={block}
            onChange={(b) => updateBlock(idx, b)}
            onDelete={() => deleteBlock(idx)}
            onMoveUp={() => moveBlock(idx, -1)}
            onMoveDown={() => moveBlock(idx, 1)}
            isFirst={idx === 0}
            isLast={idx === blocks.length - 1}
          />
          {/* Inline gap toolbar between blocks */}
          <BlockGap onAdd={(type) => insertBlock(idx, type)} />
        </div>
      ))}

      {/* Main toolbar always at bottom */}
      <div className="pt-2">
        <MainToolbar onAdd={appendBlock} />
      </div>
    </div>
  );
}
