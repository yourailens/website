-- ============================================================
-- 045 · Color grade, composition, mood & shot preset arrays
-- ============================================================

alter table public.modules
  add column if not exists color_grade_presets text[] not null default '{}',
  add column if not exists mood_presets text[] not null default '{}',
  add column if not exists composition_presets text[] not null default '{}',
  add column if not exists shot_type_presets text[] not null default '{}',
  add column if not exists aspect_ratio text;

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
    setweight(to_tsvector('english', coalesce(new.color_and_mood, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.composition_notes, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.prompt_structure, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.recommended_models, '{}'), ' ')), 'B');
  return new;
end; $$;
