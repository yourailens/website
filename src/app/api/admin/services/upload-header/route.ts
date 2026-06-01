import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { uploadObjectToS3, deleteS3ObjectIfOurs } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  const serviceId = String(fd.get("serviceId") ?? "");
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });

  const sb = createServiceRoleClient();
  const { data: row, error: fetchErr } = await sb
    .from("services")
    .select("id,slug,header_image_url")
    .eq("id", serviceId)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const slug = String(row.slug ?? "package");
  const key = `services/${slug}_header_${Date.now()}.${safeObjectFilename(ext)}`;

  try {
    const { publicUrl } = await uploadObjectToS3(
      key,
      Buffer.from(await file.arrayBuffer()),
      file.type || "image/jpeg"
    );

    const { error: updErr } = await sb
      .from("services")
      .update({ header_image_url: publicUrl })
      .eq("id", serviceId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    if (row.header_image_url) {
      await deleteS3ObjectIfOurs(String(row.header_image_url));
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: formatAwsLikeError(err).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const serviceId = req.nextUrl.searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json({ error: "serviceId required" }, { status: 400 });
  }

  const sb = createServiceRoleClient();
  const { data: row } = await sb
    .from("services")
    .select("header_image_url")
    .eq("id", serviceId)
    .single();

  if (row?.header_image_url) {
    await deleteS3ObjectIfOurs(String(row.header_image_url));
  }

  const { error } = await sb
    .from("services")
    .update({ header_image_url: null })
    .eq("id", serviceId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
