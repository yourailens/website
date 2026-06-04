import { NextRequest, NextResponse } from "next/server";
import { getModuleBySlug } from "@/lib/modules/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = await getModuleBySlug(slug);
  if (!mod) return NextResponse.json({ error: "Not found" }, { status: 404 });
  createServiceRoleClient().rpc("increment_module_view", { m_id: mod.id }).then(() => {});
  return NextResponse.json({ module: mod });
}
