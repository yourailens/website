import { NextRequest, NextResponse } from "next/server";
import { requirePlanner } from "@/lib/planner/auth";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }

  const ext = safeObjectFilename(file.name.split(".").pop() || "jpg");
  const key = `planner/${auth.member.id}/${Date.now()}-${ext}`;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { publicUrl } = await uploadObjectToS3(key, bytes, file.type || "image/jpeg");
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    const { message, hint, httpStatus } = formatAwsLikeError(err);
    return NextResponse.json({ error: message, hint }, { status: httpStatus });
  }
}
