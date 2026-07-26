-- ============================================================
-- 055 · Pricing redesign: 5 packages + hero media + gallery
-- ============================================================
-- Replaces the crowded catalogue with:
--   Films (3): Starter / Growth / Signature AI Commercial
--   Stills (2): Product Visuals Pack / Campaign Stills Suite
-- Adds per-package hero media + shareable gallery (admin-editable).
-- ============================================================

-- ── Hero media on services ───────────────────────────────────
alter table public.services
  add column if not exists hero_media_type text
    check (hero_media_type is null or hero_media_type in ('image', 'video')),
  add column if not exists hero_video_url text,
  add column if not exists hero_image_url text,
  add column if not exists hero_caption text,
  add column if not exists hero_label text;

-- ── Package gallery ──────────────────────────────────────────
create table if not exists public.service_gallery_items (
  id          uuid        primary key default gen_random_uuid(),
  service_id  uuid        not null references public.services(id) on delete cascade,
  media_type  text        not null check (media_type in ('image', 'video')),
  image_url   text,
  video_url   text,
  poster_url  text,
  caption     text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  constraint service_gallery_has_media check (
    (media_type = 'image' and image_url is not null)
    or (media_type = 'video' and video_url is not null)
  )
);

create index if not exists service_gallery_items_service_idx
  on public.service_gallery_items (service_id, sort_order);

alter table public.service_gallery_items enable row level security;

drop policy if exists "public read service gallery" on public.service_gallery_items;
create policy "public read service gallery"
  on public.service_gallery_items for select
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.is_published = true
    )
  );

drop policy if exists "service role all service gallery" on public.service_gallery_items;
create policy "service role all service gallery"
  on public.service_gallery_items for all
  using (true) with check (true);

-- ── Wipe old catalogue (keep addons) ─────────────────────────
delete from public.service_gallery_items;
delete from public.services;
delete from public.service_categories;

-- ── Two categories only ──────────────────────────────────────
insert into public.service_categories (name, slug, description, icon, sort_order)
values
  (
    'Films & commercials',
    'videos',
    'AI commercials and brand films — concept to final cut.',
    null,
    0
  ),
  (
    'Images & stills',
    'visuals',
    'Product and campaign stills ready for ads, site, and social.',
    null,
    1
  );

-- ── 1. Starter AI Commercial ─────────────────────────────────
insert into public.services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order,
  hero_media_type, hero_label, hero_caption
) values (
  'videos',
  'Starter AI Commercial',
  'starter-ai-commercial',
  'Three AI commercials. Clear scope. Fixed price.',
  'Three finished AI commercials in one package. Each film is 40 to 45 seconds. That works out to ₹10,000 per video.',
  30000, 120000, 'per project', 7,
  true, true, true,
  'Most booked', 'blue',
  '[
    {"q":"How many videos?","a":"3 videos each (40 to 45 seconds)"},
    {"q":"What does each video cost?","a":"₹10,000 per video. The full package is ₹30,000."},
    {"q":"Scriptwriting?","a":"Yes. AI plus manual dialogue writing."},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"Background music and SFX?","a":"Yes. Original audio with commercial licensing."},
    {"q":"How many aspect ratios?","a":"1 aspect ratio (9:16 or 16:9). Extra aspect ratios cost more because they need to be regenerated."},
    {"q":"How many revisions?","a":"2 revisions. Can be extended with additional cost."}
  ]'::jsonb,
  '["3 final master cuts","Scripts for each film","Licensed music and SFX"]'::jsonb,
  ARRAY['Startups','First time brands','Single campaign launches'],
  '[
    {"q":"Is this three concepts or three videos?","a":"Three finished videos. Each one is 40 to 45 seconds."},
    {"q":"What does one aspect ratio mean?","a":"You pick 9:16 for Reels and Stories or 16:9 for YouTube and web. Extra ratios are regenerated as a paid add on."},
    {"q":"Can I buy more revisions?","a":"Yes. Two rounds are included. Extra revision rounds can be added at additional cost."}
  ]'::jsonb,
  120000,
  '#2563eb', 0,
  'video', 'Sample cut', 'Starter commercial. 40 to 45 seconds each.'
);

-- ── 2. Growth AI Commercial ──────────────────────────────────
insert into public.services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order,
  hero_media_type, hero_label, hero_caption
) values (
  'videos',
  'Growth AI Commercial',
  'growth-ai-commercial',
  'More videos. More formats. More reach.',
  'Five finished AI commercials for brands that need volume for paid social and always on testing. Each film is up to 60 seconds.',
  55000, 220000, 'per project', 10,
  false, true, true,
  'Best value', 'green',
  '[
    {"q":"How many videos?","a":"5 videos each (up to 60 seconds)"},
    {"q":"What does each video cost?","a":"About ₹11,000 per video. The full package is ₹55,000."},
    {"q":"Scriptwriting?","a":"Yes. AI plus manual dialogue writing."},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"Background music and SFX?","a":"Yes. Original audio with commercial licensing."},
    {"q":"How many aspect ratios?","a":"2 aspect ratios (9:16 and 16:9). Extra aspect ratios cost more because they need to be regenerated."},
    {"q":"Short cut downs?","a":"1 short cut down (15 to 20 seconds) for ads, included."},
    {"q":"How many revisions?","a":"3 revisions. Can be extended with additional cost."}
  ]'::jsonb,
  '["5 final master cuts","1 short ad cut down","Both aspect ratios","Scripts for each film","Licensed music and SFX"]'::jsonb,
  ARRAY['Growing D2C brands','Paid social teams','Product launches'],
  '[
    {"q":"How is this different from Starter?","a":"Five videos instead of three, longer runtime, two aspect ratios included, plus one short ad cut down and an extra revision round."},
    {"q":"Can I add more cut downs later?","a":"Yes. Extra cut downs and ratios can be quoted as add ons after the first delivery."}
  ]'::jsonb,
  220000,
  '#059669', 1,
  'video', 'Growth sample', 'Growth package. Up to 60 seconds each.'
);

-- ── 3. Signature AI Commercial ───────────────────────────────
insert into public.services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order,
  hero_media_type, hero_label, hero_caption
) values (
  'videos',
  'Signature AI Commercial',
  'signature-ai-commercial',
  'Flagship films for a brand moment.',
  'Eight finished AI commercials with room for brand level polish. Mix of hero length and shorter cuts for a full campaign set.',
  95000, 380000, 'per project', 14,
  false, true, true,
  'Flagship', 'violet',
  '[
    {"q":"How many videos?","a":"8 videos (mix of up to 90 second heroes and shorter cuts)"},
    {"q":"What does each video cost?","a":"About ₹11,875 per video. The full package is ₹95,000."},
    {"q":"Scriptwriting?","a":"Yes. AI plus manual dialogue writing with a brand voice pass."},
    {"q":"AI production?","a":"Yes. Credits usage included with a premium polish pass."},
    {"q":"Background music and SFX?","a":"Yes. Original audio with commercial licensing."},
    {"q":"How many aspect ratios?","a":"3 aspect ratios (9:16, 16:9, and 1:1)."},
    {"q":"Short cut downs?","a":"2 short cut downs (15 seconds and 30 seconds) for ads, included."},
    {"q":"How many revisions?","a":"4 revisions. Can be extended with additional cost."},
    {"q":"Title and end cards?","a":"Yes. Title and end card package included."}
  ]'::jsonb,
  '["8 final cuts","2 short ad cut downs","3 aspect ratios","Title and end card pack","Scripts for each film","Licensed music and SFX"]'::jsonb,
  ARRAY['Brand campaigns','Series A+ launches','Flagship product moments'],
  '[
    {"q":"Is this a full brand film?","a":"It is a signature commercial set with multi format delivery. Closer to a campaign film system than a single social spot."},
    {"q":"Do you include strategy?","a":"Creative direction and scripting are included. Deeper brand strategy workshops can be scoped separately."}
  ]'::jsonb,
  380000,
  '#7c3aed', 2,
  'video', 'Signature reel', 'Signature package. Flagship commercial set.'
);

-- ── 4. Product Visuals Pack ──────────────────────────────────
insert into public.services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order,
  hero_media_type, hero_label, hero_caption
) values (
  'visuals',
  'Product Visuals Pack',
  'product-visuals-pack',
  'Hero stills that sell the product.',
  'A focused stills package for product pages, ads, and social. Clean hero shots with light lifestyle variants.',
  15000, 60000, 'per project', 5,
  true, false, true,
  'Fast stills', 'orange',
  '[
    {"q":"How many stills?","a":"12 finished product stills"},
    {"q":"How many styling directions?","a":"3 styling and set directions"},
    {"q":"What angles are covered?","a":"Hero, detail, and lifestyle angles"},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"How many aspect ratios?","a":"1 primary aspect ratio (1:1 or 4:5). Extra aspect ratios cost more."},
    {"q":"How many revisions?","a":"2 revision rounds. Can be extended with additional cost."},
    {"q":"Exports?","a":"Web and social export set included."}
  ]'::jsonb,
  '["12 final stills","Export set for web and social","Style board"]'::jsonb,
  ARRAY['Ecommerce','D2C product pages','Marketplace listings'],
  '[
    {"q":"Can I shoot multiple SKUs?","a":"This pack is scoped for one hero product or SKU family. Extra SKUs are quoted per set."},
    {"q":"Do I get raw files?","a":"You receive finished exports. Raw or layered source files can be added as an add on."}
  ]'::jsonb,
  60000,
  '#ea580c', 3,
  'image', 'Product still', 'Product stills. Hero product visuals.'
);

-- ── 5. Campaign Stills Suite ─────────────────────────────────
insert into public.services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order,
  hero_media_type, hero_label, hero_caption
) values (
  'visuals',
  'Campaign Stills Suite',
  'campaign-stills-suite',
  'A full stills system for one campaign.',
  'More frames, more formats, and a cohesive look across ads, site, and social. Built as one campaign system, not one off shots.',
  35000, 140000, 'per project', 8,
  false, true, true,
  'Campaign set', 'blue',
  '[
    {"q":"How many stills?","a":"28 finished campaign stills"},
    {"q":"How many creative directions?","a":"5 creative and set directions"},
    {"q":"What angles are covered?","a":"Hero, lifestyle, detail, and social crop sets"},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"How many aspect ratios?","a":"2 aspect ratio families (1:1 plus 9:16 or 4:5). Extra ratios cost more."},
    {"q":"How many revisions?","a":"3 revision rounds. Can be extended with additional cost."},
    {"q":"Exports?","a":"Platform ready export pack for Meta, site, and marketplace."},
    {"q":"Text on image variants?","a":"Optional. Up to 6 text on image variants included."}
  ]'::jsonb,
  '["28 final stills","Multi platform export pack","Style and crop guide","Up to 6 text variants"]'::jsonb,
  ARRAY['Campaign launches','Always on ads','Brand refreshes'],
  '[
    {"q":"How is this different from Product Visuals?","a":"More volume, more creative directions, two aspect families, and campaign ready exports. Not just hero product shots."},
    {"q":"Can this match our existing brand guidelines?","a":"Yes. Share guidelines or references and we lock colour, styling, and framing before production."}
  ]'::jsonb,
  140000,
  '#2563eb', 4,
  'image', 'Campaign still', 'Campaign stills. Full stills system.'
);

-- ── Trim add-ons to a lean set compatible with new packages ──
update public.service_addons set is_published = false;

update public.service_addons set
  is_published = true,
  compatible_with = ARRAY[
    'starter-ai-commercial',
    'growth-ai-commercial',
    'signature-ai-commercial',
    'product-visuals-pack',
    'campaign-stills-suite'
  ],
  sort_order = 0
where slug = 'extra-revision';

update public.service_addons set
  is_published = true,
  compatible_with = ARRAY[
    'starter-ai-commercial',
    'growth-ai-commercial',
    'signature-ai-commercial'
  ],
  description = 'Regenerate the commercial in an extra aspect ratio (for example add 1:1 or the other vertical or horizontal).',
  sort_order = 1
where slug = 'platform-pack';

update public.service_addons set
  is_published = true,
  compatible_with = ARRAY[
    'starter-ai-commercial',
    'growth-ai-commercial',
    'signature-ai-commercial',
    'product-visuals-pack',
    'campaign-stills-suite'
  ],
  sort_order = 2
where slug = 'rush-delivery';

update public.service_addons set
  is_published = true,
  compatible_with = ARRAY[
    'starter-ai-commercial',
    'growth-ai-commercial',
    'signature-ai-commercial',
    'product-visuals-pack',
    'campaign-stills-suite'
  ],
  sort_order = 3
where slug = 'raw-source-files';
