import { NextRequest, NextResponse } from "next/server";
import { getPublishedPrompts } from "@/lib/prompts/load";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const search = sp.get("q") ?? undefined;
  const media_type = (sp.get("type") ?? undefined) as "image" | "video" | undefined;
  const image_category = sp.get("image_cat") ?? undefined;
  const video_category = sp.get("video_cat") ?? undefined;
  const difficulty = sp.get("difficulty") ?? undefined;
  const featured = sp.get("featured") === "true" ? true : undefined;
  const limit = Math.min(parseInt(sp.get("limit") ?? "24", 10), 100);
  const offset = parseInt(sp.get("offset") ?? "0", 10);

  const { prompts, total } = await getPublishedPrompts({
    search,
    media_type,
    image_category,
    video_category,
    difficulty,
    featured,
    limit,
    offset,
  });

  return NextResponse.json({ prompts, total });
}
