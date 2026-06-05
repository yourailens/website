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
  const slug = String(fd.get("slug") ?? "cover");

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `prompts/${slug}_cover_${Date.now()}.${safeObjectFilename(ext)}`;
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const { publicUrl } = await uploadObjectToS3(key, buf, file.type || "image/jpeg");
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    const { message } = formatAwsLikeError(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
