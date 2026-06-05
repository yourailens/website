import { NextRequest, NextResponse } from "next/server";
import { getPromptBySlug } from "@/lib/prompts/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count in background (fire-and-forget)
  try {
    const sb = createServiceRoleClient();
    await sb.rpc("increment_prompt_view", { p_id: prompt.id });
  } catch {
    // Non-critical
  }

  return NextResponse.json({ prompt });
}
