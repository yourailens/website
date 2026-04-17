import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export type SocialLink = {
  id: string;
  title: string;
  url: string;
  sort_order: number;
  thumbnail_url?: string;
  tag?: string;
};

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

function readClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return anonClient();
  }
}

function normalizeTag(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

export async function getInstagramLinks(tag?: string): Promise<SocialLink[]> {
  const supabase = readClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("instagram_links")
    .select("id,title,url,thumbnail_url,tag,sort_order")
    .order("sort_order", { ascending: true });
  if (error) return [];
  const rows = (data ?? []) as SocialLink[];
  const requestedTag = normalizeTag(tag);
  const filteredRows = requestedTag ? rows.filter((row) => normalizeTag(row.tag) === requestedTag) : rows;
  const withThumbs = await Promise.all(
    filteredRows.map(async (row) => {
      if (row.thumbnail_url) return row;
      const thumbnail_url = await fetchInstagramThumbnail(row.url);
      return thumbnail_url ? { ...row, thumbnail_url } : row;
    })
  );
  return withThumbs;
}

export async function getYoutubeLinks(): Promise<SocialLink[]> {
  const supabase = readClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("youtube_links")
    .select("id,title,url,thumbnail_url,tag,sort_order")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as SocialLink[];
}

/**
 * Best effort thumbnail extraction from public oEmbed-style endpoint.
 * If it fails, UI still renders just the link.
 */
async function fetchInstagramThumbnail(url: string): Promise<string | undefined> {
  // 1) Fast public oEmbed-style provider
  try {
    const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint, { cache: "force-cache" });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { thumbnail_url?: string };
    if (typeof data.thumbnail_url === "string") return data.thumbnail_url;
  } catch {
    // continue to HTML fallback
  }

  // 2) Fallback: scrape OG image from page source when public
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return undefined;
    const html = await res.text();

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (ogMatch?.[1]) return decodeHtmlEntity(ogMatch[1]);

    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (twMatch?.[1]) return decodeHtmlEntity(twMatch[1]);
  } catch {
    // no thumbnail available
  }

  return undefined;
}

function decodeHtmlEntity(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
