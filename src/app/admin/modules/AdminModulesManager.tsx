"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ModuleWithAssets } from "@/data/modules";
import { MODULE_DISCIPLINE_LABELS } from "@/data/modules";
import AdminModuleEditor, { BLANK_MODULE_FORM, moduleToEditorForm, type ModuleEditorForm } from "./AdminModuleEditor";

export default function AdminModulesManager() {
  const [items, setItems] = useState<ModuleWithAssets[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ModuleWithAssets | null>(null);
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState<ModuleEditorForm>(BLANK_MODULE_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/modules");
      setItems(((await res.json()) as { modules: ModuleWithAssets[] }).modules ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function doDelete(item: ModuleWithAssets) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await fetch(`/api/admin/modules/${item.id}`, { method: "DELETE" });
    await load();
  }

  async function togglePublish(item: ModuleWithAssets) {
    await fetch(`/api/admin/modules/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    await load();
  }

  if (showing) {
    return (
      <AdminModuleEditor
        editing={editing}
        form={form}
        setForm={setForm}
        onCancel={() => setShowing(false)}
        onSaved={() => {
          load();
          setShowing(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="border-b border-blue-100/80 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-blue-700">
              ← Admin
            </Link>
            <h1 className="mt-1 font-heading text-2xl font-black text-slate-900">Director modules</h1>
            <p className="mt-1 text-sm text-slate-500">Playbooks with gear picks, workflow steps, and block prompts.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(BLANK_MODULE_FORM);
              setShowing(true);
            }}
            className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200"
          >
            + New module
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-20 text-center text-slate-500">No modules yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100/80 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="font-heading font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {MODULE_DISCIPLINE_LABELS[item.discipline]} · /modules/{item.slug}
                    {item.camera_body ? ` · ${item.camera_body}` : ""}
                    {!item.published && " · draft"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/modules/${item.slug}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-blue-200">
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      setForm(moduleToEditorForm(item));
                      setShowing(true);
                    }}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => togglePublish(item)} className="rounded-lg border px-3 py-1.5 text-xs font-bold">
                    {item.published ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" onClick={() => doDelete(item)} className="rounded-lg border px-3 py-1.5 text-xs font-bold text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
