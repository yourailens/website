import Link from "next/link";
import OttRail, { type OttCard } from "@/components/home/OttRail";
import OttSeeAllLink from "@/components/home/OttSeeAllLink";
import FilmFeature from "@/components/home/FilmFeature";
import HomeVaultTease from "@/components/home/HomeVaultTease";
import { HOME_WATCH_TITLES, getHomeWatch, type HomeWatchRail, type HomeWatchTitle } from "@/data/home-watch";
import { getHomepageFeatureOttCut, getPublishedOttCuts, isHomepageHeroCut } from "@/lib/ott-cuts/load";
import { getPublishedVaultEntries } from "@/lib/yail-vault/load";
import {
  ottCutAspectLabel,
  ottCutChannelPath,
  ottCutYoutubeId,
  type OttCut,
} from "@/data/ott-cuts";

function channelPathForRail(rail: HomeWatchRail) {
  if (rail === "ads") return "/ai-ads";
  if (rail === "community") return "/ai-verse";
  return "/ai-filmmaking";
}

function toOttCard(item: HomeWatchTitle, href?: string): OttCard {
  return {
    href: href ?? channelPathForRail(item.rail),
    title: item.title,
    tag: item.tag,
    video: item.video,
    poster: item.poster,
    embed: item.youtubeId ? `https://www.youtube.com/embed/${item.youtubeId}` : undefined,
    featured: item.featured,
    aspect: item.aspect,
    watchUrl: item.watchUrl,
    watchLabel: item.watchLabel,
  };
}

function cards(rail: HomeWatchRail) {
  const path = channelPathForRail(rail);
  // Land on that clip in the Misc filter on the channel desk.
  return HOME_WATCH_TITLES.filter((t) => t.rail === rail).map((item) =>
    toOttCard(item, `${path}#${item.slug}`)
  );
}

function cutToCard(cut: OttCut): OttCard {
  const poster = cut.aspect_ratio === "story" || cut.aspect_ratio === "portrait";
  const yt = ottCutYoutubeId(cut.media_url);
  return {
    // Open the channel desk on this cut (same pattern as format rails → #misc).
    href: `${ottCutChannelPath(cut.category)}#${cut.slug}`,
    title: cut.caption,
    tag: ottCutAspectLabel(cut.aspect_ratio),
    video: !yt && cut.media_type === "video" ? cut.media_url : undefined,
    image: cut.media_type === "image" ? cut.media_url : undefined,
    poster: cut.poster_url ?? undefined,
    embed: yt ? `https://www.youtube.com/embed/${yt}` : undefined,
    watchLabel: yt ? "Watch on YouTube" : undefined,
    aspect: poster ? "poster" : "wide",
  };
}

const PACKAGES: OttCard[] = [
  { title: "Weekly", tag: "₹38,250 · 9 films", href: "/pricing#weekly" },
  { title: "Monthly", tag: "₹1,44,000 · 36 films", href: "/pricing#monthly" },
  { title: "3 months", tag: "₹4,05,000 · 108 films", href: "/pricing#quarterly" },
  { title: "A la carte", tag: "Build the fare", href: "/pricing#alacarte" },
  { title: "AI menu", tag: "Logo, stills, more", href: "/pricing#ai-menu" },
];

export default async function HomeStudioStory() {
  const [adsCuts, filmCuts, homepageFeature, vaultEntries] = await Promise.all([
    getPublishedOttCuts("ads"),
    getPublishedOttCuts("films"),
    getHomepageFeatureOttCut(),
    getPublishedVaultEntries(),
  ]);
  const landed = [...adsCuts]
    .filter((cut) => !isHomepageHeroCut(cut))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 16)
    .map((cut) => cutToCard(cut));
  const lot = [...filmCuts]
    .filter((cut) => !cut.homepage_feature && !isHomepageHeroCut(cut))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 16)
    .map((cut) => cutToCard(cut));
  /** Newest uploads first — fallback when no homepage tease picks are set. */
  const byLatest = <T extends { created_at: string; sort_order?: number }>(a: T, b: T) => {
    const tb = Date.parse(b.created_at) || 0;
    const ta = Date.parse(a.created_at) || 0;
    if (tb !== ta) return tb - ta;
    return (b.sort_order ?? 0) - (a.sort_order ?? 0);
  };
  const toVaultCutPreview = (entry: (typeof vaultEntries)[number]) => {
    const poster = entry.poster_url?.trim() || "";
    const media = entry.media_url?.trim() || "";
    const src = poster || media;
    if (!src) return null;
    const ratio =
      entry.aspect_width && entry.aspect_height && entry.aspect_height > 0
        ? entry.aspect_width / entry.aspect_height
        : null;
    return {
      id: entry.id,
      title: entry.title,
      src,
      poster: poster || null,
      isVideo: entry.media_type === "video",
      ratio,
    };
  };
  const teaseRow = (category: "filmmaking" | "ads") => {
    const picked = [...vaultEntries]
      .filter((e) => e.category === category && e.home_tease)
      .sort((a, b) => a.home_tease_order - b.home_tease_order)
      .map(toVaultCutPreview)
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 6);
    if (picked.length) return picked;
    return [...vaultEntries]
      .filter((e) => e.category === category)
      .sort(byLatest)
      .map(toVaultCutPreview)
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 6);
  };
  const vaultFilmmaking = teaseRow("filmmaking");
  const vaultAds = teaseRow("ads");

  const trailerMeta = getHomeWatch("ai-films-trailer");
  const feature: OttCard | null = homepageFeature
    ? (() => {
        const yt = ottCutYoutubeId(homepageFeature.media_url);
        return {
          href: "/yailians",
          title: homepageFeature.caption || trailerMeta?.title || "YAILIANS",
          tag: trailerMeta?.tag ?? "45 min",
          video: !yt && homepageFeature.media_type === "video" ? homepageFeature.media_url : undefined,
          image: homepageFeature.media_type === "image" ? homepageFeature.media_url : undefined,
          poster: homepageFeature.poster_url ?? undefined,
          embed: yt ? `https://www.youtube.com/embed/${yt}` : undefined,
          featured: true,
          aspect: "wide" as const,
        };
      })()
    : trailerMeta
      ? { ...toOttCard(trailerMeta), href: "/yailians", title: trailerMeta.title || "YAILIANS" }
      : null;

  return (
    <div className="space-y-16 bg-black pb-24 pt-10 text-white sm:space-y-20">
      <section id="ads" className="relative pt-4">
        <div className="flex items-end justify-between gap-4 px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">SC. 2 · AI ADS</p>
            <h2 className="mt-2 font-body text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold leading-none tracking-tight">AI ads</h2>
          </div>
          <OttSeeAllLink href="/ai-ads" label="All ads" className="mb-0.5" />
        </div>
        <div className="mt-8 space-y-10">
          {landed.length > 0 ? (
            <OttRail tone="row" inset scene="NEW" title="Just landed" cards={landed} />
          ) : null}
          <OttRail tone="row" scene="FORMAT" title="Any format" cards={cards("ads")} />
        </div>
      </section>

      <section id="films">
        <div className="flex items-end justify-between gap-4 px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">SC. 3 · AI FILMS</p>
            <h2 className="mt-2 font-body text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold leading-none tracking-tight">AI films</h2>
            <p className="mt-2 max-w-lg text-sm font-light text-white/50">
              Our first 45 min AI film —{" "}
              <a href="/yailians" className="text-sky-300/90 transition hover:text-sky-200">
                YAILIANS
              </a>
              . Then the cuts from the desk.
            </p>
          </div>
          <OttSeeAllLink href="/yailians" label="YAILIANS" className="mb-0.5" />
        </div>
        <div className="mt-8">
          {feature ? <FilmFeature card={feature} /> : null}
        </div>
      </section>

      <HomeVaultTease
        filmmaking={vaultFilmmaking}
        ads={vaultAds}
        cutCount={vaultEntries.length}
      />

      {lot.length > 0 ? (
        <section id="lot" className="pt-2">
          <OttRail tone="row" scene="NEW" title="On the lot" cards={lot} />
        </section>
      ) : null}

      <section id="community">
        <OttRail
          scene="SC. 4 · COMMUNITY"
          title="AI community"
          kicker="Cuts from the studio and the feed."
          seeAllHref="/ai-verse"
          seeAllLabel="All community"
          cards={cards("community")}
        />
      </section>

      <section id="callsheet">
        <OttRail
          scene="SC. 5 · COMMISSION"
          title="Pricing"
          kicker="Brief. Budget. Date. Then we build."
          seeAllHref="/pricing"
          seeAllLabel="Pricing"
          cards={PACKAGES}
        />
        <div className="mt-8 px-5 sm:px-8 lg:px-16 xl:pl-52">
          <Link href="/contact" className="inline-flex items-center gap-3 text-sm font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" aria-hidden />
            Commission a world
          </Link>
        </div>
      </section>
    </div>
  );
}
