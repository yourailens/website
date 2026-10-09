"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import AiModelBadge from "@/components/vault/AiModelBadge";
import VaultPendingLink from "@/components/vault/VaultPendingLink";
import VaultShell, { type VaultShellCounts } from "@/components/vault/VaultShell";
import { aspectRatioCss } from "@/components/vault/vault-media-frame";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";
import {
  tagsOfKind,
  yailVaultCategoryLabel,
  type YailVaultEntry,
} from "@/data/yail-vault";

function AvatarCutCard({ entry }: { entry: YailVaultEntry }) {
  const thumb = entryThumb(entry);
  const genre = tagsOfKind(entry, "genre")[0]?.name;
  const [ratioCss, setRatioCss] = useState(() =>
    aspectRatioCss(entry.aspect_width, entry.aspect_height)
  );

  useEffect(() => {
    if (entry.aspect_width && entry.aspect_height) {
      setRatioCss(aspectRatioCss(entry.aspect_width, entry.aspect_height));
      return;
    }
    if (!thumb) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setRatioCss(aspectRatioCss(img.naturalWidth, img.naturalHeight));
      }
    };
    img.src = thumb;
  }, [entry.aspect_height, entry.aspect_width, thumb]);

  return (
    <VaultPendingLink
      href={`/vault/${entry.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/25"
    >
      <div className="relative w-full bg-zinc-950" style={{ aspectRatio: ratioCss }}>
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : entry.media_type === "video" ? (
          <video
            src={entry.media_url}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/30">
            <PlayGlyph size={18} />
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-3.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-300/80">
          {yailVaultCategoryLabel(entry.category)}
          {genre ? ` · ${genre}` : ""}
        </p>
        <p className="truncate text-sm font-semibold text-white">{entry.title}</p>
        {entry.ai_model ? <AiModelBadge modelId={entry.ai_model} /> : null}
      </div>
    </VaultPendingLink>
  );
}

type Props = {
  avatar: YailVaultAvatar;
  cuts: YailVaultEntry[];
  counts: VaultShellCounts;
};

function entryThumb(entry: YailVaultEntry) {
  return entry.poster_url || (entry.media_type === "image" ? entry.media_url : null);
}

function PlayGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M3 1.5v11l9-5.5L3 1.5z" />
    </svg>
  );
}

export default function VaultAvatarExperience({ avatar, cuts, counts }: Props) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    // Exactly the page you're on (origin + path), nothing reconstructed.
    const url = `${window.location.origin}${window.location.pathname}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }

    try {
      if (navigator.share) {
        await navigator.share({ url });
      }
    } catch {
      /* share cancelled */
    }
  }, []);

  return (
    <VaultShell
      counts={counts}
      activeView="avatars"
      headerKicker="AI Avatar"
      headerTitle={avatar.name}
      headerMeta="Character file"
      headerMode="bar"
    >
      <div className="relative pb-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] overflow-hidden" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar.portrait_url}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-25 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black" />
        </div>

        <div className="relative mx-auto w-[90%] pt-4 sm:pt-5">
          <div>
            <VaultPendingLink
              href="/vault?view=avatars"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
            >
              ← AI Avatars
            </VaultPendingLink>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div className="relative mx-auto w-full max-w-[18rem] overflow-hidden rounded-[1.15rem] bg-zinc-900 ring-1 ring-white/10 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)] lg:mx-0">
              <div className="relative aspect-[3/4]">
                <Image
                  src={avatar.portrait_url}
                  alt={avatar.name}
                  fill
                  priority
                  sizes="288px"
                  className="object-cover object-top"
                  unoptimized
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/80">
                Character file
                {cuts.length ? ` · ${cuts.length} lab cut${cuts.length === 1 ? "" : "s"}` : ""}
              </p>
              <h1 className="mt-3 font-body text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[0.95] tracking-tight text-white">
                {avatar.name}
              </h1>
              {avatar.tagline ? (
                <p className="mt-4 text-base font-light leading-relaxed text-white/70 sm:text-lg">
                  {avatar.tagline}
                </p>
              ) : null}
              {avatar.bio ? (
                <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-white/55">
                  {avatar.bio}
                </p>
              ) : null}

              <div className="mt-8 max-w-xs">
                <aside className="rounded-[1.25rem] border border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 sm:p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80">
                    Share this avatar
                  </p>
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

          {cuts.length ? (
            <section className="mt-12 border-t border-white/10 pt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80">
                Labs with {avatar.name}
              </p>
              <h2 className="mt-2 font-body text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Tagged cuts
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cuts.map((entry) => (
                  <li key={entry.id}>
                    <AvatarCutCard entry={entry} />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="mt-12 border-t border-white/10 pt-8 text-sm text-white/45">
              No published lab cuts tagged with {avatar.name} yet.
            </p>
          )}
        </div>
      </div>
    </VaultShell>
  );
}
