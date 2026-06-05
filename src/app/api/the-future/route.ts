import { NextResponse } from "next/server";
import { getFutureHubFields } from "@/lib/the-future/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const fields = await getFutureHubFields();
  return NextResponse.json({ fields });
}
