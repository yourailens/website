import { unstable_cache } from "next/cache";

export type SummitCounts = {
  views: number | null;
  likes: number | null;
  reposts: number | null;
  replies: number | null;
  avatar: string | null;
  thumbnail: string | null;
  handle: string | null;
};

export type SummitReach = {
  kharge: SummitCounts;
  infra: SummitCounts;
  linkedin: SummitCounts;
};

/** Last public reading, used when a network read fails. X figures are from the public posts. */
const FALLBACK: SummitReach = {
  kharge: {
    views: 147284,
    likes: 263,
    reposts: 57,
    replies: 11,
    avatar: "https://pbs.twimg.com/profile_images/2096983958907244544/gCG2vD0B_200x200.jpg",
    thumbnail: "https://pbs.twimg.com/amplify_video_thumb/2115992223913574400/img/t8UJm2SBmj3rWIBb.jpg",
    handle: "PriyankKharge",
  },
  infra: {
    views: 134876,
    likes: 871,
    reposts: 57,
    replies: 23,
    avatar: "https://pbs.twimg.com/profile_images/1416333885923684360/blsBSmR-_200x200.jpg",
    thumbnail: "https://pbs.twimg.com/amplify_video_thumb/2115992223913574400/img/t8UJm2SBmj3rWIBb.jpg",
    handle: "IndianTechGuide",
  },
  linkedin: {
    views: null,
    likes: 100,
    reposts: null,
    replies: 4,
    avatar: null,
    thumbnail:
      "https://dms.licdn.com/playlist/vid/v2/D4E05AQFCS9s3BI4L1Q/thumbnail-with-play-button-overlay-high/B4EaGLYWuLIIC0-/0/1793339785984?e=2147483647&v=beta&t=hDZGp9ibFKt1ulufn87eLl2LUOFDhV-QQmA30ejVuY8",
    handle: "IT BT Department, Karnataka",
  },
};

function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

async function fetchTweet(screen: string, id: string, fallback: SummitCounts): Promise<SummitCounts> {
  try {
    const res = await fetch(`https://api.fxtwitter.com/${screen}/status/${id}`, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { tweet?: Record<string, unknown> };
    const tweet = data.tweet;
    if (!tweet) return fallback;
    const author = (tweet.author ?? {}) as Record<string, unknown>;
    const media = (tweet.media ?? {}) as { videos?: { thumbnail_url?: string }[] };
    const retweets = num(tweet.retweets) ?? 0;
    const quotes = num(tweet.quotes) ?? 0;
    return {
      views: num(tweet.views) ?? fallback.views,
      likes: num(tweet.likes) ?? fallback.likes,
      reposts: retweets + quotes || fallback.reposts,
      replies: num(tweet.replies) ?? fallback.replies,
      avatar: typeof author.avatar_url === "string" ? author.avatar_url : fallback.avatar,
      thumbnail: media.videos?.[0]?.thumbnail_url || fallback.thumbnail,
      handle: typeof author.screen_name === "string" ? author.screen_name : fallback.handle,
    };
  } catch {
    return fallback;
  }
}

async function loadSummitReach(): Promise<SummitReach> {
  const [kharge, infra] = await Promise.all([
    fetchTweet("PriyankKharge", "2115992389978632566", FALLBACK.kharge),
    fetchTweet("IndianTechGuide", "2116048787663978569", FALLBACK.infra),
  ]);
  return { kharge, infra, linkedin: FALLBACK.linkedin };
}

export const getSummitReach = unstable_cache(loadSummitReach, ["summit-reach-v1"], {
  revalidate: 3600,
});

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}
