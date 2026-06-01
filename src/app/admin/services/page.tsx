"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Service } from "@/data/services";
import { formatPrice } from "@/data/services";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => { setServices(d.services ?? []); setLoading(false); });
  };

  useEffect(load, []);

  const togglePublish = async (s: Service) => {
    setToggling(s.id);
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !s.is_published }),
    });
    setToggling(null);
    load();
  };

  const deleteService = async (s: Service) => {
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Services</h1>
            <p className="text-sm text-slate-500">Manage your digital product catalogue</p>
          </div>
          <Link
            href="/pricing"
            target="_blank"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Preview page →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <p className="text-[11px] text-slate-400">/pricing/{s.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">{s.category_slug.replace("-", " ")}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{formatPrice(s.price)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.delivery_days === 1 ? "24hr" : `${s.delivery_days}d`}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(s)}
                        disabled={toggling === s.id}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                          s.is_published
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {toggling === s.id ? "…" : s.is_published ? "Live" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/services/${s.id}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/pricing/${s.slug}`}
                          target="_blank"
                          className="text-xs text-slate-400 hover:text-slate-700"
                        >
                          Preview
                        </Link>
                        <button
                          onClick={() => deleteService(s)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
