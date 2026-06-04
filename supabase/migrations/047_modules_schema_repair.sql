-- ============================================================
-- 047 · Repair modules schema (run if 044–046 were skipped or partial)
-- Fixes: "Could not find the 'aspect_ratio' column of 'modules'"
-- ============================================================

-- 044 · gear fields
alter table public.modules
  add column if not exists camera_body text,
  add column if not exists lens_model text,
  add column if not exists focal_length text,
  add column if not exists aperture text,
  add column if not exists camera_notes text;

alter table public.modules
  add column if not exists lighting_presets text[] not null default '{}';

-- 045 · director preset arrays + delivery aspect ratio (modules.aspect_ratio)
alter table public.modules
  add column if not exists color_grade_presets text[] not null default '{}',
  add column if not exists mood_presets text[] not null default '{}',
  add column if not exists composition_presets text[] not null default '{}',
  add column if not exists shot_type_presets text[] not null default '{}',
  add column if not exists aspect_ratio text;

-- 046 · cover variants
alter table public.modules
  add column if not exists cover_variants jsonb not null default '{}'::jsonb;

alter table public.modules drop constraint if exists modules_cover_aspect_check;

alter table public.modules
  add constraint modules_cover_aspect_check
  check (cover_aspect in ('portrait', 'square', 'landscape', 'wide', 'story'));

-- Keep search index in sync with all module text fields
create or replace function public.modules_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.tagline, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.director_brief, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.camera_body, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.lens_model, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.camera_setup, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.lighting_setup, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.lighting_presets, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.color_grade_presets, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.mood_presets, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.composition_presets, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.shot_type_presets, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.aspect_ratio, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.color_and_mood, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.composition_notes, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.prompt_structure, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.recommended_models, '{}'), ' ')), 'B');
  return new;
end; $$;

-- Ask PostgREST to reload schema (Supabase API)
notify pgrst, 'reload schema';
