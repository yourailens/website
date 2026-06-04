-- ============================================================
-- 044 · Structured camera / lens fields for modules
-- ============================================================

alter table public.modules
  add column if not exists camera_body text,
  add column if not exists lens_model text,
  add column if not exists focal_length text,
  add column if not exists aperture text,
  add column if not exists camera_notes text,
  add column if not exists lighting_presets text[] not null default '{}';

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
    setweight(to_tsvector('english', coalesce(new.prompt_structure, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.recommended_models, '{}'), ' ')), 'B');
  return new;
end; $$;
