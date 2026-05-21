import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  const slug = String(fd.get("slug") ?? "board");
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const key = `mood-boards/${slug}_${Date.now()}.${safeObjectFilename(file.name.split(".").pop() ?? "jpg")}`;
  try {
    const { publicUrl } = await uploadObjectToS3(key, Buffer.from(await file.arrayBuffer()), file.type || "image/jpeg");
    return NextResponse.json({ url: publicUrl });
  } catch (err) { return NextResponse.json({ error: (formatAwsLikeError(err)).message }, { status: 500 }); }
}
