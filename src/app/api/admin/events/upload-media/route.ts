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

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Use an image file for the poster" }, { status: 400 });
  }

  const ext = safeObjectFilename(file.name.split(".").pop() || "jpg");
  const key = `studio-events/${Date.now()}-${ext}`;

  try {
    const { publicUrl } = await uploadObjectToS3(
      key,
      Buffer.from(await file.arrayBuffer()),
      file.type || "image/jpeg"
    );
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    const { message, hint, httpStatus } = formatAwsLikeError(err);
    return NextResponse.json({ error: message, hint }, { status: httpStatus });
  }
}
