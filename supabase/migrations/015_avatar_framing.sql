-- Hero / gallery framing: fixed aspect ratios + focal point (object-position) for consistent layouts.

alter table public.avatar_characters
  add column if not exists hero_aspect text not null default 'portrait'
    check (hero_aspect in ('portrait', 'square', 'landscape', 'wide'));

alter table public.avatar_characters
  add column if not exists hero_focal text not null default 'center'
    check (
      hero_focal in (
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top_left',
        'top_right',
        'bottom_left',
        'bottom_right'
      )
    );

alter table public.avatar_character_images
  add column if not exists display_aspect text not null default 'landscape'
    check (display_aspect in ('portrait', 'square', 'landscape', 'wide'));

alter table public.avatar_character_images
  add column if not exists focal text not null default 'center'
    check (
      focal in (
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top_left',
        'top_right',
        'bottom_left',
        'bottom_right'
      )
    );
