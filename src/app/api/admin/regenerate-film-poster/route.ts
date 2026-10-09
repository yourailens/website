import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";

export const runtime = "nodejs";

/** Server-side ffmpeg/sharp poster extraction was removed so Vercel deploys stay under package limits. */
export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  return NextResponse.json(
    {
      ok: false,
      posterError:
        "Auto poster generation is disabled on the server. Upload a poster image with the film instead.",
    },
    { status: 501 }
  );
}
