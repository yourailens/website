import { getYailVaultAiModel } from "@/data/yail-vault-models";

type Props = {
  modelId: string | null | undefined;
  size?: "sm" | "md";
  className?: string;
};

export default function AiModelBadge({ modelId, size = "sm", className = "" }: Props) {
  const model = getYailVaultAiModel(modelId);
  if (!model) return null;

  const compact = size === "sm";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/55 text-white/90 backdrop-blur-sm ${
        compact ? "px-2 py-1" : "px-2.5 py-1.5"
      } ${className}`}
      title={`${model.name} · ${model.company}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={model.logo}
        alt=""
        className={`shrink-0 object-contain opacity-95 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
        aria-hidden
      />
      <span className="min-w-0 truncate leading-none">
        <span className={`block font-medium ${compact ? "text-[10px]" : "text-[11px]"}`}>{model.name}</span>
        <span className={`block text-white/50 ${compact ? "text-[8px]" : "text-[9px]"}`}>{model.company}</span>
      </span>
    </span>
  );
}
