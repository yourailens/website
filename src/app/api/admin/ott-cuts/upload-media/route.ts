import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = safeObjectFilename(file.name.split(".").pop() || (file.type.startsWith("video/") ? "mp4" : "jpg"));
  const isVideo = file.type.startsWith("video/");
  const key = `ott-cuts/${Date.now()}-${ext}`;

  try {
    const { publicUrl } = await uploadObjectToS3(
      key,
      Buffer.from(await file.arrayBuffer()),
      file.type || (isVideo ? "video/mp4" : "image/jpeg")
    );
    return NextResponse.json({ url: publicUrl, media_type: isVideo ? "video" : "image" });
  } catch (err) {
    const { message, hint, httpStatus } = formatAwsLikeError(err);
    return NextResponse.json({ error: message, hint }, { status: httpStatus });
  }
}
