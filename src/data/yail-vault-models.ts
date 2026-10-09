/** Curated GenAI models for YAIL Vault credits. Logos live in /public/images/ai-models. */

export type YailVaultAiModel = {
  id: string;
  name: string;
  company: string;
  /** Path under /public */
  logo: string;
};

export const YAIL_VAULT_AI_MODELS: readonly YailVaultAiModel[] = [
  { id: "runway-gen4", name: "Runway Gen-4", company: "Runway", logo: "/images/ai-models/runway.svg" },
  { id: "runway-gen3", name: "Runway Gen-3", company: "Runway", logo: "/images/ai-models/runway.svg" },
  { id: "kling", name: "Kling", company: "Kuaishou", logo: "/images/ai-models/kling.svg" },
  { id: "veo", name: "Veo", company: "Google DeepMind", logo: "/images/ai-models/google.svg" },
  { id: "sora", name: "Sora", company: "OpenAI", logo: "/images/ai-models/openai.svg" },
  {
    id: "luma-dream-machine",
    name: "Dream Machine",
    company: "Luma AI",
    logo: "/images/ai-models/luma.svg",
  },
  { id: "pika", name: "Pika", company: "Pika Labs", logo: "/images/ai-models/pika.svg" },
  { id: "midjourney", name: "Midjourney", company: "Midjourney", logo: "/images/ai-models/midjourney.svg" },
  { id: "seedance", name: "Seedance", company: "ByteDance", logo: "/images/ai-models/bytedance.svg" },
  { id: "hailuo", name: "Hailuo", company: "MiniMax", logo: "/images/ai-models/minimax.svg" },
  { id: "flux", name: "Flux", company: "Black Forest Labs", logo: "/images/ai-models/flux.svg" },
  { id: "wan", name: "Wan", company: "Alibaba", logo: "/images/ai-models/alibaba.svg" },
  {
    id: "hunyuan-video",
    name: "Hunyuan Video",
    company: "Tencent",
    logo: "/images/ai-models/tencent.svg",
  },
  { id: "higgsfield", name: "Higgsfield", company: "Higgsfield", logo: "/images/ai-models/higgsfield.svg" },
  { id: "leonardo", name: "Leonardo", company: "Leonardo.Ai", logo: "/images/ai-models/leonardo.svg" },
  { id: "heygen", name: "HeyGen", company: "HeyGen", logo: "/images/ai-models/heygen.svg" },
  { id: "synthesia", name: "Synthesia", company: "Synthesia", logo: "/images/ai-models/synthesia.svg" },
] as const;

export type YailVaultAiModelId = (typeof YAIL_VAULT_AI_MODELS)[number]["id"];

const byId = new Map(YAIL_VAULT_AI_MODELS.map((m) => [m.id, m]));

export function isYailVaultAiModelId(value: unknown): value is YailVaultAiModelId {
  return typeof value === "string" && byId.has(value);
}

export function getYailVaultAiModel(id: string | null | undefined): YailVaultAiModel | null {
  if (!id) return null;
  return byId.get(id) ?? null;
}
