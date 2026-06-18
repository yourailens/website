-- Allow natural (intrinsic) aspect ratio on gallery items
alter table public.studio_module_items
  drop constraint if exists studio_module_items_aspect_ratio_check;

alter table public.studio_module_items
  add constraint studio_module_items_aspect_ratio_check
  check (aspect_ratio in ('natural', 'portrait', 'square', 'landscape', 'wide', 'story'));

alter table public.studio_module_items
  alter column aspect_ratio set default 'natural';
