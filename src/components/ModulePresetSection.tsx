export default function ModulePresetSection({
  title,
  presets,
  note,
}: {
  title: string;
  presets: string[];
  note?: string | null;
}) {
  if (presets.length === 0 && !note?.trim()) return null;
  return (
    <section>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">{title}</p>
      {presets.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((p) => (
            <span
              key={p}
              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900"
            >
              {p}
            </span>
          ))}
        </div>
      )}
      {note?.trim() ? (
        <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{note}</p>
      ) : null}
    </section>
  );
}
