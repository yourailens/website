import type { WorkflowStep } from "@/data/modules";
import { WORKFLOW_MEDIA_ROLE_LABELS } from "@/data/modules";

function MediaThumb({ asset }: { asset: NonNullable<WorkflowStep["assets"]>[number] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {asset.media_type === "video" ? (
        <video src={asset.url} controls className="aspect-video w-full bg-black object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.url} alt={asset.caption ?? ""} className="aspect-video w-full object-cover" loading="lazy" />
      )}
      <div className="px-2 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
          {WORKFLOW_MEDIA_ROLE_LABELS[asset.role]}
        </span>
        {asset.caption ? <p className="text-[11px] text-slate-500">{asset.caption}</p> : null}
      </div>
    </div>
  );
}

export default function ModuleWorkflowStep({ step, index }: { step: WorkflowStep; index: number }) {
  const inputs = step.inputs?.trim();
  const prompt = step.prompt?.trim();
  const output = step.output?.trim();
  const body = step.body?.trim();
  const assets = step.assets ?? [];
  const inputMedia = assets.filter((a) => a.role === "input");
  const outputMedia = assets.filter((a) => a.role === "output");
  const refMedia = assets.filter((a) => a.role === "prompt_ref");

  return (
    <li className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-bold text-slate-900">{step.title}</h3>
          {body ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p> : null}
          {step.duration ? (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">{step.duration}</p>
          ) : null}

          {(inputs || prompt || output) && (
            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-700">Inputs</p>
                {inputs ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{inputs}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">—</p>
                )}
                {inputMedia.length > 0 && (
                  <div className="mt-3 grid gap-2">{inputMedia.map((a) => <MediaThumb key={a.id} asset={a} />)}</div>
                )}
              </div>

              <div className="hidden items-center justify-center text-slate-300 lg:flex" aria-hidden>
                →
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-blue-700">Prompt</p>
                {prompt ? (
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
                    {prompt}
                  </pre>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">—</p>
                )}
                {refMedia.length > 0 && (
                  <div className="mt-3 grid gap-2">{refMedia.map((a) => <MediaThumb key={a.id} asset={a} />)}</div>
                )}
              </div>

              <div className="hidden items-center justify-center text-slate-300 lg:flex" aria-hidden>
                →
              </div>

              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-violet-700">Output</p>
                {output ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{output}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">—</p>
                )}
                {outputMedia.length > 0 && (
                  <div className="mt-3 grid gap-2">{outputMedia.map((a) => <MediaThumb key={a.id} asset={a} />)}</div>
                )}
              </div>
            </div>
          )}

          {!inputs && !prompt && !output && assets.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{assets.map((a) => <MediaThumb key={a.id} asset={a} />)}</div>
          )}
        </div>
      </div>
    </li>
  );
}
