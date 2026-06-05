"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FutureModuleListCard from "@/components/the-future/FutureModuleListCard";
import { FUTURE_COPY } from "@/data/the-future-copy";
import type { FutureFieldWithModules } from "@/data/the-future";

export default function AdminTheFutureHub() {
  const [fields, setFields] = useState<FutureFieldWithModules[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/the-future");
      const data = (await res.json()) as { fields: FutureFieldWithModules[] };
      setFields(data.fields ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="border-b border-blue-100/80 bg-white px-6 py-8 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-blue-700">
            ← Admin
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-black text-slate-900">The Future</h1>
          <p className="mt-2 text-slate-600">
            Each field and {FUTURE_COPY.moduleOne} opens as a <strong>full-page inline editor</strong> — same layout
            visitors see, with images on every card.
          </p>
          <Link
            href="/the-future"
            target="_blank"
            className="mt-4 inline-block text-sm font-bold text-blue-600 hover:text-blue-800"
          >
            View public hub ↗
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {fields.map((field) => (
              <section key={field.id} className="overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Field</p>
                      <h2 className="mt-1 font-heading text-2xl font-black text-slate-900">{field.title}</h2>
                      {!field.published ? (
                        <span className="mt-1 inline-block text-xs font-bold text-amber-600">Draft</span>
                      ) : null}
                    </div>
                    <Link
                      href={`/admin/the-future/fields/${field.id}`}
                      className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700"
                    >
                      Edit field →
                    </Link>
                  </div>
                </div>
                <ul className="divide-y divide-slate-50">
                  {field.modules.length === 0 ? (
                    <li className="px-4 py-8 text-center text-sm text-slate-500">No {FUTURE_COPY.moduleMany} yet.</li>
                  ) : (
                    field.modules.map((m, i) => (
                      <li key={m.id}>
                        <FutureModuleListCard
                          mod={m}
                          href={`/admin/the-future/modules/${m.id}`}
                          index={i}
                          showDraft
                        />
                      </li>
                    ))
                  )}
                </ul>
                <div className="border-t border-slate-100 px-6 py-4">
                  <Link
                    href={`/admin/the-future/modules/new?field_id=${field.id}`}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800"
                  >
                    + New {FUTURE_COPY.moduleOne} (full-page editor)
                  </Link>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
