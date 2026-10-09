-- ============================================================
-- 072 · Drop Industries, Modules, and Reference Libraries
-- Removes public + admin data for retired site sections.
-- Safe to re-run: every drop uses IF EXISTS.
-- ============================================================

-- ---------- Industries ----------
drop table if exists public.industry_sample_brand_media cascade;
drop table if exists public.industry_sample_brands cascade;
drop table if exists public.industry_playbook_examples cascade;
drop table if exists public.industry_playbooks cascade;
drop table if exists public.industries cascade;

-- ---------- Studio modules (gallery playbooks) ----------
drop table if exists public.studio_module_items cascade;
drop table if exists public.studio_modules cascade;

drop function if exists public.studio_modules_search_vector_update() cascade;
drop function if exists public.studio_modules_set_updated_at() cascade;
drop function if exists public.increment_studio_module_view(uuid);

drop type if exists public.studio_module_type cascade;
drop type if exists public.studio_module_media_type cascade;
drop type if exists public.studio_module_aspect cascade;

-- ---------- Legacy director modules ----------
drop table if exists public.module_assets cascade;
drop table if exists public.modules cascade;

drop type if exists public.module_asset_kind cascade;
drop type if exists public.module_discipline cascade;

drop function if exists public.modules_search_vector_update() cascade;
drop function if exists public.modules_set_updated_at() cascade;
drop function if exists public.increment_module_view(uuid);

-- ---------- Reference libraries ----------
drop table if exists public.prompts cascade;
drop table if exists public.outfits cascade;
drop table if exists public.scenarios cascade;
drop table if exists public.locations cascade;
drop table if exists public.character_sheets cascade;
drop table if exists public.props cascade;
drop table if exists public.lighting_presets cascade;
drop table if exists public.color_grades cascade;
drop table if exists public.mood_boards cascade;

drop function if exists public.increment_prompt_view(uuid);
drop function if exists public.increment_outfit_view(uuid);
drop function if exists public.increment_outfit_download(uuid);
drop function if exists public.increment_scenario_view(uuid);
drop function if exists public.increment_scenario_download(uuid);
drop function if exists public.increment_location_view(uuid);
drop function if exists public.increment_location_download(uuid);
drop function if exists public.increment_character_sheet_view(uuid);
drop function if exists public.increment_character_sheet_download(uuid);
drop function if exists public.increment_prop_view(uuid);
drop function if exists public.increment_prop_download(uuid);
drop function if exists public.increment_lighting_preset_view(uuid);
drop function if exists public.increment_lighting_preset_download(uuid);
drop function if exists public.increment_color_grade_view(uuid);
drop function if exists public.increment_color_grade_download(uuid);
drop function if exists public.increment_mood_board_view(uuid);
drop function if exists public.increment_mood_board_download(uuid);

drop function if exists public.prompts_search_vector_update() cascade;
drop function if exists public.prompts_set_updated_at() cascade;
drop function if exists public.outfits_search_vector_update() cascade;
drop function if exists public.outfits_set_updated_at() cascade;
drop function if exists public.scenarios_search_vector_update() cascade;
drop function if exists public.scenarios_set_updated_at() cascade;
drop function if exists public.locations_search_vector_update() cascade;
drop function if exists public.locations_set_updated_at() cascade;
drop function if exists public.character_sheets_search_vector_update() cascade;
drop function if exists public.character_sheets_set_updated_at() cascade;
drop function if exists public.props_search_vector_update() cascade;
drop function if exists public.props_set_updated_at() cascade;
drop function if exists public.lighting_presets_search_vector_update() cascade;
drop function if exists public.lighting_presets_set_updated_at() cascade;
drop function if exists public.color_grades_search_vector_update() cascade;
drop function if exists public.color_grades_set_updated_at() cascade;
drop function if exists public.mood_boards_search_vector_update() cascade;
drop function if exists public.mood_boards_set_updated_at() cascade;

drop type if exists public.prompt_media_type cascade;
drop type if exists public.prompt_image_category cascade;
drop type if exists public.prompt_video_category cascade;
drop type if exists public.prompt_difficulty cascade;
drop type if exists public.outfit_category cascade;
drop type if exists public.outfit_character_type cascade;
drop type if exists public.scenario_type cascade;
drop type if exists public.scenario_setting cascade;
drop type if exists public.scenario_mood cascade;
drop type if exists public.location_category cascade;
drop type if exists public.location_time_of_day cascade;
drop type if exists public.location_weather cascade;
drop type if exists public.character_ethnicity cascade;
drop type if exists public.character_age_group cascade;
drop type if exists public.character_gender cascade;
drop type if exists public.character_skin_tone cascade;
drop type if exists public.character_archetype cascade;
drop type if exists public.prop_category cascade;
drop type if exists public.prop_style cascade;
drop type if exists public.lighting_type cascade;
drop type if exists public.lighting_mood cascade;
drop type if exists public.color_grade_style cascade;
drop type if exists public.color_grade_mood cascade;
drop type if exists public.aesthetic_style cascade;
