"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import AiModelBadge from "@/components/vault/AiModelBadge";
import VaultPlayer from "@/components/vault/VaultPlayer";
import VaultShell, { type VaultShellCounts, type VaultView } from "@/components/vault/VaultShell";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";
import {
  tagsOfKind,
  yailVaultCategoryLabel,
  type YailVaultEntry,
} from "@/data/yail-vault";

type Props = {
  entry: YailVaultEntry;
  avatars: YailVaultAvatar[];
  counts: VaultShellCounts;
  shareUrl: string;
};

export default function VaultCutExperience({ entry, avatars, counts, shareUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const genre = tagsOfKind(entry, "genre")[0]?.name;
  const subject = tagsOfKind(entry, "subject")[0]?.name;
  const labels = tagsOfKind(entry, "label");
  const poster = entry.poster_url || (entry.media_type === "image" ? entry.media_url : null);

  const activeView: VaultView = entry.category;

  const share = useCallback(async () => {
    const url = shareUrl || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${entry.title} · YAIL Vault`,
          text: entry.caption ?? entry.title,
          url,
        });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [entry.caption, entry.title, shareUrl]);

  return (
    <VaultShell
      counts={counts}
      activeView={activeView}
      headerKicker={yailVaultCategoryLabel(entry.category)}
      headerTitle={entry.title}
      headerMeta="Lab cut"
      headerMode="bar"
    >
      <div className="relative pb-14">
        {/* Ambient stage */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] overflow-hidden" aria-hidden>
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="h-full w-full scale-110 object-cover opacity-25 blur-3xl" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black" />
        </div>

        <div className="relative mx-auto w-[90%] pt-4 sm:pt-5">
          <div>
            <Link
              href={`/vault?view=${entry.category}`}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
            >
              ← {yailVaultCategoryLabel(entry.category)}
            </Link>
          </div>

          {/* Player — ~5% inset each side (90% width) */}
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)]">
            {entry.media_type === "video" ? (
              <VaultPlayer src={entry.media_url} poster={poster} title={entry.title} />
            ) : poster ? (
              <div className="relative aspect-video bg-black">
                <Image
                  src={poster}
                  alt={entry.title}
                  fill
                  priority
                  sizes="90vw"
                  className="object-contain"
                  unoptimized
                />
                <div className="pointer-events-none absolute right-4 top-4 opacity-30" aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo_yail.png" alt="" className="h-7 w-auto sm:h-8" draggable={false} />
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-zinc-950" />
            )}
          </div>

          {/* Meta + share */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start lg:gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/80">
                {yailVaultCategoryLabel(entry.category)}
                {genre ? ` · ${genre}` : ""}
              </p>
              <h1 className="mt-3 font-body text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[0.95] tracking-tight text-white">
                {entry.title}
              </h1>
              {entry.caption ? (
                <p className="mt-4 text-base font-light leading-relaxed text-white/70 sm:text-lg">
                  {entry.caption}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <AiModelBadge modelId={entry.ai_model} size="md" />
                {avatars.map((avatar) => (
                  <span
                    key={avatar.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar.portrait_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                    {avatar.name}
                  </span>
                ))}
                {subject ? (
                  <span className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60">
                    Subject · {subject}
                  </span>
                ) : null}
                {labels.map((t) => (
                  <span key={t.id} className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/65">
                    {t.name}
                  </span>
                ))}
              </div>

              {entry.notes ? (
                <div className="mt-8 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">Lab notes</p>
                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-white/75">
                    {entry.notes}
                  </p>
                </div>
              ) : null}
            </div>

            <aside className="rounded-[1.25rem] border border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80">Share this cut</p>
              <button
                type="button"
                onClick={() => void share()}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#fafafa] px-4 py-3 text-sm font-semibold text-black transition hover:bg-sky-100"
              >
                {copied ? "Link copied" : "Share / copy link"}
              </button>
            </aside>
          </div>
        </div>
      </div>
    </VaultShell>
  );
}
