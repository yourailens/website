import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { adminGetAllIndustries } from "@/lib/industries/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ industries: await adminGetAllIndustries() });
}
