-- Framing was replaced by interactive crop (exported JPEG). Drop unused columns.

alter table public.avatar_characters drop column if exists hero_aspect;
alter table public.avatar_characters drop column if exists hero_focal;

alter table public.avatar_character_images drop column if exists display_aspect;
alter table public.avatar_character_images drop column if exists focal;
