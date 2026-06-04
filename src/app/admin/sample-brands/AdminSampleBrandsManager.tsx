"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { IndustryWithPlaybooks } from "@/data/industries";
import type { SampleBrandWithMedia } from "@/data/sample-brands";

export default function AdminSampleBrandsManager() {
  const [brands, setBrands] = useState<SampleBrandWithMedia[]>([]);
  const [industries, setIndustries] = useState<IndustryWithPlaybooks[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [msg, setMsg] = useState("");

  const [newIndustryId, setNewIndustryId] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, iRes] = await Promise.all([
        fetch("/api/admin/sample-brands"),
        fetch("/api/admin/industries"),
      ]);
      const bData = (await bRes.json()) as { brands?: SampleBrandWithMedia[] };
      const iData = (await iRes.json()) as { industries?: IndustryWithPlaybooks[] };
      setBrands(bData.brands ?? []);
      const inds = iData.industries ?? [];
      setIndustries(inds);
      if (!newIndustryId && inds[0]) setNewIndustryId(inds[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filterIndustry === "all") return brands;
    return brands.filter((b) => b.industry_id === filterIndustry);
  }, [brands, filterIndustry]);

  const createBrand = async () => {
    if (!newIndustryId || !newSlug.trim() || !newName.trim()) {
      setMsg("Industry, slug, and name are required.");
      return;
    }
    setCreating(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/sample-brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry_id: newIndustryId,
          slug: newSlug.trim().toLowerCase().replace(/\s+/g, "-"),
          name: newName.trim(),
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Create failed");
      setNewSlug("");
      setNewName("");
      setMsg("Brand created — open it to add hero and gallery media.");
      window.location.href = `/admin/sample-brands/${data.id}`;
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (brand: SampleBrandWithMedia) => {
    await fetch(`/api/admin/sample-brands/${brand.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !brand.published }),
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
            <h1 className="mt-2 font-heading text-2xl font-black text-slate-900">Sample brands</h1>
            <p className="mt-1 text-sm text-slate-500">
              Multimedia brand worlds per industry — images &amp; videos tagged by ratio and category.
            </p>
          </div>
          <Link
            href="/industries"
            target="_blank"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Preview industries →
          </Link>
        </div>

        {msg ? (
          <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{msg}</p>
        ) : null}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">New sample brand</h2>
          <p className="mt-1 text-xs text-slate-500">Run migration 036 in Supabase if the table is missing.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-[10px] font-medium text-slate-600">
              Industry
              <select
                value={newIndustryId}
                onChange={(e) => setNewIndustryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {industries.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[10px] font-medium text-slate-600">
              Slug
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="luna-botanica"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-[10px] font-medium text-slate-600">
              Name
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Luna Botanica"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={creating}
            onClick={createBrand}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create brand"}
          </button>
        </div>

        <label className="mb-4 flex items-center gap-2 text-sm text-slate-600">
          Filter industry
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option value="all">All</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((brand) => {
              const pubMedia = brand.media.filter((m) => m.published).length;
              const path =
                brand.industry_slug && brand.published
                  ? `/industries/${brand.industry_slug}/brands/${brand.slug}`
                  : null;
              return (
                <div
                  key={brand.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {brand.industry_name ?? "Industry"}
                    </p>
                    <h2 className="mt-1 font-heading text-lg font-black text-slate-900">{brand.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {brand.media.length} assets ({pubMedia} published) · slug: {brand.slug}
                      {path ? (
                        <>
                          {" "}
                          ·{" "}
                          <a href={path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            {path}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        brand.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {brand.published ? "Live" : "Draft"}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePublish(brand)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      {brand.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link
                      href={`/admin/sample-brands/${brand.id}`}
                      className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-slate-500">No brands yet — create one above or run migration 036.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
