import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStudioModuleBySlug } from "@/lib/studio-modules/load";
import { studioModuleTypeFromSlug } from "@/data/studio-modules";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ typeSlug: string; slug: string }> }
) {
  const { typeSlug, slug } = await params;
  const moduleType = studioModuleTypeFromSlug(typeSlug);
  if (!moduleType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const mod = await getStudioModuleBySlug(moduleType, slug);
  if (!mod) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const sb = createServiceRoleClient();
    await sb.rpc("increment_studio_module_view", { p_id: mod.id });
  } catch {
    // non-fatal
  }

  return NextResponse.json({ module: mod });
}
