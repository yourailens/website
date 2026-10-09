"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ADMIN_BTN,
  ADMIN_BTN_GHOST,
  ADMIN_BUBBLE_PAD,
  ADMIN_KICKER,
  ADMIN_PAGE,
  ADMIN_ROW,
} from "@/components/admin/admin-ui";
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
    <div className={ADMIN_PAGE}>
      <div className={ADMIN_BUBBLE_PAD}>
        <p className={ADMIN_KICKER}>Lab</p>
        <h2 className="mt-1.5 font-heading text-2xl leading-none tracking-tight">The Future</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
          Each field and {FUTURE_COPY.moduleOne} opens as a full-page inline editor — same layout visitors see, with
          images on every card.
        </p>
        <Link href="/the-future" target="_blank" className={`mt-5 inline-flex ${ADMIN_BTN_GHOST}`}>
          View public hub ↗
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      ) : (
        <div className="space-y-6">
          {fields.map((field) => (
            <section key={field.id} className={`${ADMIN_BUBBLE_PAD} !p-0 overflow-hidden`}>
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className={ADMIN_KICKER}>Field</p>
                    <h2 className="mt-1 font-heading text-2xl leading-none tracking-tight">{field.title}</h2>
                    {field.tagline ? (
                      <p className="mt-2 text-sm text-white/45">{field.tagline}</p>
                    ) : null}
                  </div>
                  <Link href={`/admin/the-future/fields/${field.id}`} className={ADMIN_BTN}>
                    Edit field
                  </Link>
                </div>
              </div>

              <ul className="divide-y divide-white/8">
                {(field.modules ?? []).length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-white/40 sm:px-6">
                    No {FUTURE_COPY.moduleMany} yet.
                  </li>
                ) : (
                  (field.modules ?? []).map((mod) => (
                    <li key={mod.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                      <div className="min-w-0">
                        <p className="truncate font-heading text-lg leading-tight">{mod.title}</p>
                        <p className="mt-1 text-xs text-white/40">
                          {mod.published ? "Published" : "Draft"} · /the-future/{field.slug}/{mod.slug}
                        </p>
                      </div>
                      <Link
                        href={`/admin/the-future/modules/${mod.id}`}
                        className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-black"
                      >
                        Edit
                      </Link>
                    </li>
                  ))
                )}
              </ul>

              <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                <Link
                  href={`/admin/the-future/modules/new?field_id=${field.id}`}
                  className={`${ADMIN_BTN_GHOST} inline-flex text-xs`}
                >
                  + Add {FUTURE_COPY.moduleOne}
                </Link>
              </div>
            </section>
          ))}

          {fields.length === 0 ? (
            <div className={`${ADMIN_ROW} text-center text-sm text-white/45`}>No fields yet.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
