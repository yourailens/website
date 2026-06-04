-- Hero / cover: explicit image vs video + aspect ratio (+ optional video poster)

ALTER TABLE public.industries
  ADD COLUMN IF NOT EXISTS hero_media_type text NOT NULL DEFAULT 'image'
    CHECK (hero_media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS hero_aspect_ratio text NOT NULL DEFAULT 'landscape'
    CHECK (hero_aspect_ratio IN ('portrait', 'square', 'landscape')),
  ADD COLUMN IF NOT EXISTS hero_poster_url text,
  ADD COLUMN IF NOT EXISTS cover_media_type text NOT NULL DEFAULT 'image'
    CHECK (cover_media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS cover_aspect_ratio text NOT NULL DEFAULT 'landscape'
    CHECK (cover_aspect_ratio IN ('portrait', 'square', 'landscape')),
  ADD COLUMN IF NOT EXISTS cover_poster_url text;

-- Backfill type from file extension where URL exists
UPDATE public.industries
SET hero_media_type = CASE
  WHEN hero_image_url ~* '\.(mp4|webm|mov)(\?|$)' THEN 'video'
  ELSE 'image'
END
WHERE hero_image_url IS NOT NULL;

UPDATE public.industries
SET cover_media_type = CASE
  WHEN cover_image_url ~* '\.(mp4|webm|mov)(\?|$)' THEN 'video'
  ELSE 'image'
END
WHERE cover_image_url IS NOT NULL;
