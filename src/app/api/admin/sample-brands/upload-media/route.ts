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
  const file = fd.get("file") as File | null;
  const slug = String(fd.get("slug") ?? "sample-brand");
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = safeObjectFilename(file.name.split(".").pop() ?? "jpg");
  const isVideo = file.type.startsWith("video/");
  const key = `sample-brands/${slug}_${Date.now()}.${ext}`;
  try {
    const { publicUrl } = await uploadObjectToS3(
      key,
      Buffer.from(await file.arrayBuffer()),
      file.type || (isVideo ? "video/mp4" : "image/jpeg")
    );
    return NextResponse.json({ url: publicUrl, media_type: isVideo ? "video" : "image" });
  } catch (err) {
    return NextResponse.json({ error: formatAwsLikeError(err).message }, { status: 500 });
  }
}
