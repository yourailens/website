import { Suspense } from "react";
import AdminFutureModuleNew from "./AdminFutureModuleNew";

export const dynamic = "force-dynamic";

export default function AdminFutureModuleNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f7fc]">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <AdminFutureModuleNew />
    </Suspense>
  );
}
