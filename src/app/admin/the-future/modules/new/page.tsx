import { Suspense } from "react";
import AdminFutureModuleNew from "./AdminFutureModuleNew";

export const dynamic = "force-dynamic";

export default function AdminFutureModuleNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      }
    >
      <AdminFutureModuleNew />
    </Suspense>
  );
}
