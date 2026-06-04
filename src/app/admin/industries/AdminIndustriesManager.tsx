"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { IndustryWithPlaybooks } from "@/data/industries";

export default function AdminIndustriesManager() {
  const [items, setItems] = useState<IndustryWithPlaybooks[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/industries");
      const data = (await res.json()) as { industries?: IndustryWithPlaybooks[] };
      setItems(data.industries ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublish = async (item: IndustryWithPlaybooks) => {
    await fetch(`/api/admin/industries/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              ← Admin
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-black text-slate-900">Industries</h1>
            <p className="mt-1 text-sm text-slate-500">
              Vertical showcases with playbooks and example media for sales calls.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/sample-brands"
              className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100"
            >
              Sample brands →
            </Link>
            <Link
              href="/industries"
              target="_blank"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Preview hub →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const exampleCount = item.playbooks.reduce((n, p) => n + p.examples.length, 0);
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Industry</p>
                    <h2 className="mt-1 font-heading text-lg font-black text-slate-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.playbooks.length} playbooks · {exampleCount} examples · /industries/{item.slug}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        item.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.published ? "Live" : "Draft"}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePublish(item)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      {item.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link
                      href={`/admin/industries/${item.id}`}
                      className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Run <code className="rounded bg-slate-200 px-1">030</code> then{" "}
          <code className="rounded bg-slate-200 px-1">031_industries_qa_format.sql</code> in Supabase for Q&amp;A copy.
        </p>
      </div>
    </div>
  );
}
