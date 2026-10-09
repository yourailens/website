import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";
import { extractFilmPosterJpeg } from "@/lib/video/extract-poster";

export const runtime = "nodejs";
/** Frame grab plus two S3 uploads can exceed the default limit. */
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = safeObjectFilename(file.name.split(".").pop() || (file.type.startsWith("video/") ? "mp4" : "jpg"));
  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name);
  const key = `ott-cuts/${Date.now()}-${ext}`;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { publicUrl } = await uploadObjectToS3(key, bytes, file.type || (isVideo ? "video/mp4" : "image/jpeg"));
    let poster_url: string | null = null;
    if (isVideo) {
      const extracted = await extractFilmPosterJpeg(bytes, file.name || "clip.mp4");
      if (extracted.ok) {
        const posterKey = `ott-cuts/posters/${Date.now()}.jpg`;
        const poster = await uploadObjectToS3(posterKey, extracted.jpeg, "image/jpeg");
        poster_url = poster.publicUrl;
      }
    }
    return NextResponse.json({ url: publicUrl, media_type: isVideo ? "video" : "image", poster_url });
  } catch (err) {
    const { message, hint, httpStatus } = formatAwsLikeError(err);
    return NextResponse.json({ error: message, hint }, { status: httpStatus });
  }
}
