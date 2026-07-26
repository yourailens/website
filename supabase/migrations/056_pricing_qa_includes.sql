-- ============================================================
-- 056 · Package scope as Q&A (no dashes, video count pricing)
-- ============================================================
-- Starter: 3 videos each (40 to 45 seconds) = ₹10,000 per video
-- Includes stored as [{q,a}] for Q and A display on pricing pages.
-- ============================================================

-- Starter AI Commercial
update public.services set
  tagline = 'Three AI commercials. Clear scope. Fixed price.',
  description = 'Three finished AI commercials in one package. Each film is 40 to 45 seconds. That works out to ₹10,000 per video.',
  includes = '[
    {"q":"How many videos?","a":"3 videos each (40 to 45 seconds)"},
    {"q":"What does each video cost?","a":"₹10,000 per video. The full package is ₹30,000."},
    {"q":"Scriptwriting?","a":"Yes. AI plus manual dialogue writing."},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"Background music and SFX?","a":"Yes. Original audio with commercial licensing."},
    {"q":"How many aspect ratios?","a":"1 aspect ratio (9:16 or 16:9). Extra aspect ratios cost more because they need to be regenerated."},
    {"q":"How many revisions?","a":"2 revisions. Can be extended with additional cost."}
  ]'::jsonb,
  deliverables = '["3 final master cuts","Scripts for each film","Licensed music and SFX"]'::jsonb,
  faqs = '[
    {"q":"Is this three concepts or three videos?","a":"Three finished videos. Each one is 40 to 45 seconds."},
    {"q":"What does one aspect ratio mean?","a":"You pick 9:16 for Reels and Stories or 16:9 for YouTube and web. Extra ratios are regenerated as a paid add on."},
    {"q":"Can I buy more revisions?","a":"Yes. Two rounds are included. Extra revision rounds can be added at additional cost."}
  ]'::jsonb,
  hero_caption = 'Starter commercial. 40 to 45 seconds each.'
where slug = 'starter-ai-commercial';

-- Growth AI Commercial
update public.services set
  tagline = 'More videos. More formats. More reach.',
  description = 'Five finished AI commercials for brands that need volume for paid social and always on testing. Each film is up to 60 seconds.',
  includes = '[
    {"q":"How many videos?","a":"5 videos each (up to 60 seconds)"},
    {"q":"What does each video cost?","a":"About ₹11,000 per video. The full package is ₹55,000."},
    {"q":"Scriptwriting?","a":"Yes. AI plus manual dialogue writing."},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"Background music and SFX?","a":"Yes. Original audio with commercial licensing."},
    {"q":"How many aspect ratios?","a":"2 aspect ratios (9:16 and 16:9). Extra aspect ratios cost more because they need to be regenerated."},
    {"q":"Short cut downs?","a":"1 short cut down (15 to 20 seconds) for ads, included."},
    {"q":"How many revisions?","a":"3 revisions. Can be extended with additional cost."}
  ]'::jsonb,
  deliverables = '["5 final master cuts","1 short ad cut down","Both aspect ratios","Scripts for each film","Licensed music and SFX"]'::jsonb,
  faqs = '[
    {"q":"How is this different from Starter?","a":"Five videos instead of three, longer runtime, two aspect ratios included, plus one short ad cut down and an extra revision round."},
    {"q":"Can I add more cut downs later?","a":"Yes. Extra cut downs and ratios can be quoted as add ons after the first delivery."}
  ]'::jsonb,
  hero_caption = 'Growth package. Up to 60 seconds each.'
where slug = 'growth-ai-commercial';

-- Signature AI Commercial
update public.services set
  tagline = 'Flagship films for a brand moment.',
  description = 'Eight finished AI commercials with room for brand level polish. Mix of hero length and shorter cuts for a full campaign set.',
  includes = '[
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
  deliverables = '["8 final cuts","2 short ad cut downs","3 aspect ratios","Title and end card pack","Scripts for each film","Licensed music and SFX"]'::jsonb,
  faqs = '[
    {"q":"Is this a full brand film?","a":"It is a signature commercial set with multi format delivery. Closer to a campaign film system than a single social spot."},
    {"q":"Do you include strategy?","a":"Creative direction and scripting are included. Deeper brand strategy workshops can be scoped separately."}
  ]'::jsonb,
  hero_caption = 'Signature package. Flagship commercial set.'
where slug = 'signature-ai-commercial';

-- Product Visuals Pack
update public.services set
  tagline = 'Hero stills that sell the product.',
  description = 'A focused stills package for product pages, ads, and social. Clean hero shots with light lifestyle variants.',
  includes = '[
    {"q":"How many stills?","a":"12 finished product stills"},
    {"q":"How many styling directions?","a":"3 styling and set directions"},
    {"q":"What angles are covered?","a":"Hero, detail, and lifestyle angles"},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"How many aspect ratios?","a":"1 primary aspect ratio (1:1 or 4:5). Extra aspect ratios cost more."},
    {"q":"How many revisions?","a":"2 revision rounds. Can be extended with additional cost."},
    {"q":"Exports?","a":"Web and social export set included."}
  ]'::jsonb,
  deliverables = '["12 final stills","Export set for web and social","Style board"]'::jsonb,
  faqs = '[
    {"q":"Can I shoot multiple SKUs?","a":"This pack is scoped for one hero product or SKU family. Extra SKUs are quoted per set."},
    {"q":"Do I get raw files?","a":"You receive finished exports. Raw or layered source files can be added as an add on."}
  ]'::jsonb,
  hero_caption = 'Product stills. Hero product visuals.'
where slug = 'product-visuals-pack';

-- Campaign Stills Suite
update public.services set
  tagline = 'A full stills system for one campaign.',
  description = 'More frames, more formats, and a cohesive look across ads, site, and social. Built as one campaign system, not one off shots.',
  includes = '[
    {"q":"How many stills?","a":"28 finished campaign stills"},
    {"q":"How many creative directions?","a":"5 creative and set directions"},
    {"q":"What angles are covered?","a":"Hero, lifestyle, detail, and social crop sets"},
    {"q":"AI production?","a":"Yes. Credits usage included."},
    {"q":"How many aspect ratios?","a":"2 aspect ratio families (1:1 plus 9:16 or 4:5). Extra ratios cost more."},
    {"q":"How many revisions?","a":"3 revision rounds. Can be extended with additional cost."},
    {"q":"Exports?","a":"Platform ready export pack for Meta, site, and marketplace."},
    {"q":"Text on image variants?","a":"Optional. Up to 6 text on image variants included."}
  ]'::jsonb,
  deliverables = '["28 final stills","Multi platform export pack","Style and crop guide","Up to 6 text variants"]'::jsonb,
  faqs = '[
    {"q":"How is this different from Product Visuals?","a":"More volume, more creative directions, two aspect families, and campaign ready exports. Not just hero product shots."},
    {"q":"Can this match our existing brand guidelines?","a":"Yes. Share guidelines or references and we lock colour, styling, and framing before production."}
  ]'::jsonb,
  hero_caption = 'Campaign stills. Full stills system.'
where slug = 'campaign-stills-suite';

-- Lean add on copy without dashes
update public.service_addons set
  description = 'Regenerate the commercial in an extra aspect ratio (for example add 1:1 or the other vertical or horizontal).'
where slug = 'platform-pack';
