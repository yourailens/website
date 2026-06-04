import { NextResponse } from "next/server";
import { getPublishedIndustries } from "@/lib/industries/load";

export const revalidate = 60;

export async function GET() {
  const industries = await getPublishedIndustries();
  return NextResponse.json(
    { industries },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
