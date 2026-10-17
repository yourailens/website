-- ============================================================
-- 087 · YAILIANS Voices = interview videos
-- poster_url → thumbnail / video poster
-- quote     → optional pull-quote (no longer required)
-- video_url → already exists; interviews live there
-- ============================================================

alter table public.yailians_voices
  add column if not exists poster_url text;

alter table public.yailians_voices
  alter column quote drop not null;

comment on column public.yailians_voices.video_url is
  'Interview video URL (S3 or external). Primary media for Voices.';

comment on column public.yailians_voices.poster_url is
  'Poster / thumbnail still for the interview video.';

comment on column public.yailians_voices.quote is
  'Optional short pull-quote from the interview.';

comment on column public.yailians_voices.portrait_url is
  'Optional circular portrait of the speaker (separate from video poster).';
