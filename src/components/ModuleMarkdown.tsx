"use client";

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
    if (s.type === "bold") return <strong key={i} className="font-bold text-slate-900">{s.val}</strong>;
    if (s.type === "code")
      return (
        <code key={i} className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[0.82em] text-blue-700">
          {s.val}
        </code>
      );
    return s.val;
  });
}

export default function ModuleMarkdown({ body }: { body: string }) {
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
        <div key={`code-${i}`} className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-[#0f172a]">
          {lang ? (
            <div className="border-b border-white/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {lang}
            </div>
          ) : null}
          <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-slate-200">
            <code>{block.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={`h1-${i}`} className="mt-8 mb-3 font-heading text-2xl font-black text-slate-900 first:mt-0">
          {renderInline(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={`h2-${i}`} className="mt-6 mb-2 flex items-center gap-2 font-heading text-lg font-black text-slate-900">
          <span className="h-1 w-5 shrink-0 rounded-full bg-blue-500" />
          {renderInline(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      const bq: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        bq.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <blockquote key={`bq-${i}`} className="my-4 rounded-r-xl border-l-4 border-blue-500 bg-blue-50/60 px-4 py-3 text-sm italic text-slate-700">
          {bq.map((l, li) => (
            <p key={li}>{renderInline(l)}</p>
          ))}
        </blockquote>
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
        <ol key={`ol-${i}`} className="my-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {items.map((item, li) => (
            <li key={li}>{renderInline(item)}</li>
          ))}
        </ol>
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
        <ul key={`ul-${i}`} className="my-3 space-y-1.5">
          {items.map((item, li) => (
            <li key={li} className="flex gap-2.5 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    nodes.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-slate-700">
        {renderInline(line)}
      </p>
    );
    i++;
  }
  return <div className="prose-module space-y-1">{nodes}</div>;
}
