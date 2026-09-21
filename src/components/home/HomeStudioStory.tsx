import Link from "next/link";
import OttRail, { type OttCard } from "@/components/home/OttRail";
import OttSeeAllLink from "@/components/home/OttSeeAllLink";
import FilmFeature from "@/components/home/FilmFeature";
import { HOME_WATCH_TITLES, getHomeWatch, type HomeWatchRail, type HomeWatchTitle } from "@/data/home-watch";
import { getHomepageFeatureOttCut, getPublishedOttCuts } from "@/lib/ott-cuts/load";
import { ottCutAspectLabel, ottCutYoutubeId, type OttCut } from "@/data/ott-cuts";

function toOttCard(item: HomeWatchTitle): OttCard {
  return {
    href: `/watch/${item.slug}`,
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
  return HOME_WATCH_TITLES.filter((t) => t.rail === rail).map(toOttCard);
}

function cutToCard(cut: OttCut, path: string): OttCard {
  const poster = cut.aspect_ratio === "story" || cut.aspect_ratio === "portrait";
  const yt = ottCutYoutubeId(cut.media_url);
  return {
    href: `${path}#${cut.slug}`,
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
  const [adsCuts, filmCuts, homepageFeature] = await Promise.all([
    getPublishedOttCuts("ads"),
    getPublishedOttCuts("films"),
    getHomepageFeatureOttCut(),
  ]);
  const landed = [...adsCuts]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 16)
    .map((cut) => cutToCard(cut, "/ai-ads"));
  const lot = [...filmCuts]
    .filter((cut) => !cut.homepage_feature)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 16)
    .map((cut) => cutToCard(cut, "/ai-filmmaking"));

  const trailerMeta = getHomeWatch("ai-films-trailer");
  const feature: OttCard | null = homepageFeature
    ? (() => {
        const yt = ottCutYoutubeId(homepageFeature.media_url);
        return {
          href: `/ai-filmmaking#${homepageFeature.slug}`,
          title: homepageFeature.caption || trailerMeta?.title || "Our first 45 min AI film",
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
      ? toOttCard(trailerMeta)
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
            <p className="mt-2 max-w-lg text-sm font-light text-white/50">Our first 45 min AI film. Then the cuts from the desk.</p>
          </div>
          <OttSeeAllLink href="/ai-filmmaking" label="All films" className="mb-0.5" />
        </div>
        <div className="mt-8 space-y-10">
          {feature ? <FilmFeature card={feature} /> : null}
          {lot.length > 0 ? <OttRail tone="row" scene="NEW" title="On the lot" cards={lot} /> : null}
        </div>
      </section>

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
          title="Call sheet"
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
