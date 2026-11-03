import { createServiceRoleClient } from "@/lib/supabase/admin";

export type SummitFilm = {
  video_url: string | null;
  poster_url: string | null;
  updated_at: string;
};

const EMPTY: SummitFilm = {
  video_url: null,
  poster_url: null,
  updated_at: new Date(0).toISOString(),
};

function softEmpty(message: string) {
  return /does not exist|schema cache/i.test(message);
}

function rowToFilm(row: Record<string, unknown>): SummitFilm {
  return {
    video_url: (row.video_url as string | null) ?? null,
    poster_url: (row.poster_url as string | null) ?? null,
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function getSummitFilm(): Promise<SummitFilm> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("summit_film").select("*").eq("id", 1).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return EMPTY;
    throw new Error(error.message);
  }
  return data ? rowToFilm(data as Record<string, unknown>) : EMPTY;
}

export async function saveSummitFilm(patch: {
  video_url?: string | null;
  poster_url?: string | null;
}): Promise<SummitFilm> {
  const db = createServiceRoleClient();
  const current = await getSummitFilm();
  const next = {
    id: 1,
    video_url:
      patch.video_url !== undefined ? patch.video_url?.trim() || null : current.video_url,
    poster_url:
      patch.poster_url !== undefined ? patch.poster_url?.trim() || null : current.poster_url,
  };
  const { data, error } = await db.from("summit_film").upsert(next).select("*").single();
  if (error) {
    if (softEmpty(error.message)) {
      throw new Error(
        "Run supabase/migrations/109_summit_film.sql in the Supabase SQL editor first."
      );
    }
    throw new Error(error.message);
  }
  return rowToFilm(data as Record<string, unknown>);
}
