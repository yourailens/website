"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import type {
  IndustryAspectRatio,
  IndustryMediaType,
  IndustryPlaybookExample,
  IndustryPlaybookWithExamples,
  IndustryWithPlaybooks,
} from "@/data/industries";
import { MediaSlotFields, MediaTypeAspectPickers, type MediaSlotValue } from "../MediaSlotFields";

async function uploadMedia(file: File, slug: string) {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("slug", slug);
  const res = await fetch("/api/admin/industries/upload-media", { method: "POST", body: fd });
  const data = (await res.json()) as { url?: string; media_type?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return { url: data.url, media_type: (data.media_type ?? "image") as "image" | "video" };
}

export default function AdminIndustryEditor() {
  const { id } = useParams<{ id: string }>();
  const [industry, setIndustry] = useState<IndustryWithPlaybooks | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null);
  const [didExpandInit, setDidExpandInit] = useState(false);

  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [hero, setHero] = useState<MediaSlotValue>({
    url: "",
    mediaType: "image",
    aspectRatio: "landscape",
    posterUrl: "",
    caption: "",
  });
  const [exampleDraft, setExampleDraft] = useState<
    Record<
      string,
      {
        title: string;
        caption: string;
        mediaType: IndustryMediaType;
        aspectRatio: IndustryAspectRatio;
        posterUrl: string;
      }
    >
  >({});
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/industries/${id}`);
      const data = (await res.json()) as { industry?: IndustryWithPlaybooks };
      const ind = data.industry ?? null;
      setIndustry(ind);
      if (ind) {
        setName(ind.name);
        setQuestion(ind.question ?? "");
        setAnswer(ind.answer ?? "");
        setTagline(ind.tagline ?? "");
        setDescription(ind.description ?? "");
        setHero({
          url: ind.hero_image_url ?? "",
          mediaType: ind.hero_media_type ?? "image",
          aspectRatio: ind.hero_aspect_ratio ?? "landscape",
          posterUrl: ind.hero_poster_url ?? "",
          caption: ind.hero_caption ?? "",
        });
        setSortOrder(ind.sort_order);
        setPublished(ind.published);
        if (!didExpandInit && ind.playbooks[0]) {
          setExpandedPlaybook(ind.playbooks[0].id);
          setDidExpandInit(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id, didExpandInit]);

  useEffect(() => {
    load();
  }, [load]);

  const persistMainVisual = async (slot: MediaSlotValue) => {
    const res = await fetch(`/api/admin/industries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hero_image_url: slot.url.trim() || null,
        hero_media_type: slot.mediaType,
        hero_aspect_ratio: slot.aspectRatio,
        hero_poster_url: slot.posterUrl.trim() || null,
        hero_caption: slot.caption.trim() || null,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Could not save main visual (run migrations 034 & 035?)");
    }
    setMsg("Main visual saved — refresh your industry page to see it.");
    await load();
  };

  const saveIndustry = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/industries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          question: question || null,
          answer: answer || null,
          tagline: tagline || null,
          description: description || null,
          hero_image_url: hero.url.trim() || null,
          hero_media_type: hero.mediaType,
          hero_aspect_ratio: hero.aspectRatio,
          hero_poster_url: hero.posterUrl.trim() || null,
          hero_caption: hero.caption.trim() || null,
          sort_order: sortOrder,
          published,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg("Industry saved.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const patchExample = async (exampleId: string, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/industries/examples/${exampleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Could not update visual");
    await load();
  };

  const getExampleDraft = (playbookId: string) =>
    exampleDraft[playbookId] ?? {
      title: "",
      caption: "",
      mediaType: "image" as IndustryMediaType,
      aspectRatio: "landscape" as IndustryAspectRatio,
      posterUrl: "",
    };

  const addExample = async (playbook: IndustryPlaybookWithExamples, file: File) => {
    if (!industry) return;
    const draft = getExampleDraft(playbook.id);
    const { url, media_type } = await uploadMedia(file, `${industry.slug}-${playbook.slug}`);
    const res = await fetch("/api/admin/industries/examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playbook_id: playbook.id,
        title: draft.title || file.name,
        media_url: url,
        media_type: draft.mediaType || media_type,
        aspect_ratio: draft.aspectRatio,
        poster_url: draft.posterUrl || null,
        caption: draft.caption.trim() || null,
        published: true,
        sort_order: playbook.examples.length,
      }),
    });
    if (!res.ok) throw new Error("Could not add example");
    setMsg(`Added visual to ${playbook.name}`);
    await load();
  };

  const toggleExample = async (exampleId: string, pub: boolean) => {
    await fetch(`/api/admin/industries/examples/${exampleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !pub }),
    });
    await load();
  };

  const deleteExample = async (exampleId: string) => {
    if (!confirm("Delete this example?")) return;
    await fetch(`/api/admin/industries/examples/${exampleId}`, { method: "DELETE" });
    await load();
  };

  const togglePlaybook = async (playbookId: string, pub: boolean) => {
    await fetch(`/api/admin/industries/playbooks/${playbookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !pub }),
    });
    await load();
  };

  const savePlaybook = async (
    playbookId: string,
    fields: { question: string; answer: string; tagline: string; description: string }
  ) => {
    const res = await fetch(`/api/admin/industries/playbooks/${playbookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: fields.question || null,
        answer: fields.answer || null,
        tagline: fields.tagline || null,
        description: fields.description || null,
      }),
    });
    if (!res.ok) throw new Error("Playbook save failed");
    setMsg("Playbook Q&A saved.");
    await load();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-center">
        <p className="text-slate-600">Industry not found.</p>
        <Link href="/admin/industries" className="mt-4 inline-block text-sm font-bold text-blue-600">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <Link href="/admin/industries" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            ← Industries
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-black text-slate-900">{industry.name}</h1>
          <p className="mt-1 text-sm text-slate-500">/industries/{industry.slug}</p>
          <Link
            href="/admin/sample-brands"
            className="mt-3 inline-block text-xs font-bold text-teal-700 hover:underline"
          >
            Manage sample brands for this vertical →
          </Link>
        </header>

        {msg ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{msg}</p>
        ) : null}

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-slate-900">Industry details</h2>
          <label className="block text-xs font-medium text-slate-600">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Main question (industry page hero)
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Where can I use AI in real estate?"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Main answer
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Tagline
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <MediaSlotFields
            label="Main page visual"
            hint="This is the big image/video beside your main answer on /industries/{slug}. Uploads save automatically. Pick Video + ratio if needed."
            value={hero}
            onChange={setHero}
            onUpload={async (file) => {
              if (!industry) throw new Error("No industry");
              return uploadMedia(file, industry.slug);
            }}
            onAfterUpload={async (next) => {
              try {
                await persistMainVisual(next);
              } catch (err) {
                setMsg(err instanceof Error ? err.message : "Upload ok but save failed");
              }
            }}
          />
          {hero.url ? (
            <p className="text-[10px] text-slate-500">
              Live preview:{" "}
              <a
                href={`/industries/${industry.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 hover:underline"
              >
                Open industry page →
              </a>
            </p>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              No main visual yet — upload above. Playbook visuals below only appear in each module row, not at the top.
            </p>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await persistMainVisual(hero);
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Error");
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Save main visual again
          </button>
          <div className="flex flex-wrap gap-4">
            <label className="text-xs font-medium text-slate-600">
              Sort
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-1 block w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 pt-5 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveIndustry}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save industry"}
          </button>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-slate-900">Playbook Q&amp;A modules</h2>
          <p className="text-sm text-slate-500">
            Each module is one question + answer. Visuals you add here show in the <strong>rows below</strong> the main
            question — not in the big slot at the top (use Main page visual above for that).
          </p>
          {industry.playbooks.map((pb) => (
            <div key={pb.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex w-full items-center justify-between gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setExpandedPlaybook(expandedPlaybook === pb.id ? null : pb.id)}
                  className="min-w-0 flex-1 rounded-lg text-left transition hover:bg-slate-50"
                >
                  <p className="font-semibold text-slate-900">{pb.question ?? pb.name}</p>
                  <p className="text-xs text-slate-500">
                    {pb.examples.length} visuals · /industries/{industry.slug}/{pb.slug}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePlaybook(pb.id, pb.published)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                      pb.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {pb.published ? "Live" : "Off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedPlaybook(expandedPlaybook === pb.id ? null : pb.id)}
                    className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-50"
                    aria-expanded={expandedPlaybook === pb.id}
                    aria-label={expandedPlaybook === pb.id ? "Collapse playbook" : "Expand playbook"}
                  >
                    {expandedPlaybook === pb.id ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {expandedPlaybook === pb.id ? (
                <>
                  <PlaybookQAEditor
                    playbook={pb}
                    industrySlug={industry.slug}
                    onSave={(fields) => savePlaybook(pb.id, fields)}
                  />
                  <div className="border-t border-slate-100 px-5 py-4">
                    <p className="text-xs font-medium text-slate-500">Playbook gallery visuals</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Shown in &quot;What this looks like in practice&quot; on the playbook page. Add a caption for each.
                    </p>
                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3">
                      <label className="block text-[10px] font-medium text-slate-600">
                        Title (optional label above visual)
                        <input
                          value={getExampleDraft(pb.id).title}
                          onChange={(e) =>
                            setExampleDraft((d) => ({
                              ...d,
                              [pb.id]: { ...getExampleDraft(pb.id), title: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                        />
                      </label>
                      <label className="mt-2 block text-[10px] font-medium text-slate-600">
                        Caption / description (shown under visual on playbook page)
                        <textarea
                          value={getExampleDraft(pb.id).caption}
                          onChange={(e) =>
                            setExampleDraft((d) => ({
                              ...d,
                              [pb.id]: { ...getExampleDraft(pb.id), caption: e.target.value },
                            }))
                          }
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                        />
                      </label>
                      <div className="mt-2">
                        <MediaTypeAspectPickers
                          namePrefix={`new-${pb.id}`}
                          mediaType={getExampleDraft(pb.id).mediaType}
                          aspectRatio={getExampleDraft(pb.id).aspectRatio}
                          onMediaType={(mediaType) =>
                            setExampleDraft((d) => ({
                              ...d,
                              [pb.id]: { ...getExampleDraft(pb.id), mediaType },
                            }))
                          }
                          onAspectRatio={(aspectRatio) =>
                            setExampleDraft((d) => ({
                              ...d,
                              [pb.id]: { ...getExampleDraft(pb.id), aspectRatio },
                            }))
                          }
                        />
                      </div>
                      {getExampleDraft(pb.id).mediaType === "video" ? (
                        <label className="mt-2 block text-[10px] font-medium text-slate-600">
                          Poster URL
                          <input
                            value={getExampleDraft(pb.id).posterUrl}
                            onChange={(e) =>
                              setExampleDraft((d) => ({
                                ...d,
                                [pb.id]: { ...getExampleDraft(pb.id), posterUrl: e.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          />
                        </label>
                      ) : null}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        id={`upload-${pb.id}`}
                        className="mt-3 w-full text-xs"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            await addExample(pb, f);
                            setMsg("Visual uploaded.");
                          } catch (err) {
                            setMsg(err instanceof Error ? err.message : "Upload failed");
                          }
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <ul className="mt-4 space-y-3">
                      {pb.examples.map((ex) => (
                        <ExampleVisualRow
                          key={ex.id}
                          example={ex}
                          namePrefix={ex.id}
                          onPatch={(patch) => patchExample(ex.id, patch)}
                          onTogglePublish={() => toggleExample(ex.id, ex.published)}
                          onDelete={() => deleteExample(ex.id)}
                          published={ex.published}
                        />
                      ))}
                      {pb.examples.length === 0 ? (
                        <p className="text-xs text-slate-400">No visuals yet — shown on industry + playbook pages.</p>
                      ) : null}
                    </ul>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function ExampleVisualRow({
  example,
  namePrefix,
  onPatch,
  onTogglePublish,
  onDelete,
  published,
}: {
  example: IndustryPlaybookExample;
  namePrefix: string;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onTogglePublish: () => void;
  onDelete: () => void;
  published: boolean;
}) {
  const [title, setTitle] = useState(example.title);
  const [caption, setCaption] = useState(example.caption ?? "");
  const [mediaType, setMediaType] = useState(example.media_type);
  const [aspectRatio, setAspectRatio] = useState(example.aspect_ratio);
  const [posterUrl, setPosterUrl] = useState(example.poster_url ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(example.title);
    setCaption(example.caption ?? "");
    setMediaType(example.media_type);
    setAspectRatio(example.aspect_ratio);
    setPosterUrl(example.poster_url ?? "");
  }, [example]);

  const save = async () => {
    setSaving(true);
    try {
      await onPatch({
        title,
        caption: caption.trim() || null,
        media_type: mediaType,
        aspect_ratio: aspectRatio,
        poster_url: posterUrl || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex flex-wrap gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
          {mediaType === "video" ? (
            <video src={example.media_url} poster={posterUrl || undefined} className="h-full w-full object-cover" muted />
          ) : (
            <Image src={example.media_url} alt="" fill className="object-cover" sizes="96px" unoptimized />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold"
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption / description for playbook page"
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
          />
          <MediaTypeAspectPickers
            namePrefix={namePrefix}
            mediaType={mediaType}
            aspectRatio={aspectRatio}
            onMediaType={setMediaType}
            onAspectRatio={setAspectRatio}
          />
          {mediaType === "video" ? (
            <input
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="Poster URL"
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
            />
          ) : null}
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="text-[10px] font-bold text-blue-600 hover:underline disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save visual settings"}
          </button>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" onClick={onTogglePublish} className="text-[10px] font-bold text-slate-500">
            {published ? "Unpublish" : "Publish"}
          </button>
          <button type="button" onClick={onDelete} className="text-[10px] font-bold text-red-500">
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

function PlaybookQAEditor({
  playbook,
  industrySlug,
  onSave,
}: {
  playbook: IndustryPlaybookWithExamples;
  industrySlug: string;
  onSave: (fields: { question: string; answer: string; tagline: string; description: string }) => Promise<void>;
}) {
  const [question, setQuestion] = useState(playbook.question ?? "");
  const [answer, setAnswer] = useState(playbook.answer ?? "");
  const [tagline, setTagline] = useState(playbook.tagline ?? "");
  const [description, setDescription] = useState(playbook.description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQuestion(playbook.question ?? "");
    setAnswer(playbook.answer ?? "");
    setTagline(playbook.tagline ?? "");
    setDescription(playbook.description ?? "");
  }, [playbook]);

  return (
    <div className="border-t border-slate-100 px-5 py-4">
      <Link
        href={`/industries/${industrySlug}/${playbook.slug}`}
        target="_blank"
        className="text-xs font-bold text-blue-600 hover:underline"
      >
        Preview playbook page →
      </Link>
      <div className="mt-4 space-y-3">
        <label className="block text-xs font-medium text-slate-600">
          Question
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Answer
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Short tagline (optional)
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Call notes (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ question, answer, tagline, description });
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Q&A"}
        </button>
      </div>
    </div>
  );
}
