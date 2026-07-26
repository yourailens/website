import { redirect } from "next/navigation";

/** Legacy deep link — packages now edit inline on /admin/services */
export default async function EditServiceRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/admin/services");
}
