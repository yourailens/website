import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { loadAdminServices } from "@/lib/services/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ services: await loadAdminServices() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = await req.json() as Record<string, unknown>;
  const { data, error } = await createServiceRoleClient()
    .from("services")
    .insert(b)
    .select("id,slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
