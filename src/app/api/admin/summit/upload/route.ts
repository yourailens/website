import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Upload a video or a poster image" }, { status: 400 });
  }

  const ext = safeObjectFilename(file.name.split(".").pop() || (isVideo ? "mp4" : "jpg"));
  const key = `summit/${Date.now()}-${ext}`;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { publicUrl } = await uploadObjectToS3(
      key,
      bytes,
      file.type || (isVideo ? "video/mp4" : "image/jpeg")
    );
    return NextResponse.json({
      url: publicUrl,
      media_type: isVideo ? "video" : "image",
    });
  } catch (err) {
    const { message, hint, httpStatus } = formatAwsLikeError(err);
    return NextResponse.json({ error: message, hint }, { status: httpStatus });
  }
}
