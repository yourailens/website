-- ============================================================
-- 043 · Sample director modules (draft — publish via admin)
-- ============================================================

insert into public.modules (
  slug, title, tagline, description, discipline, cover_aspect,
  director_brief, camera_setup, lighting_setup, lens_and_focal,
  composition_notes, color_and_mood, workflow_steps, recommended_models,
  prompt_structure, prompt_tips, common_mistakes, published, featured, sort_order
) values
(
  'product-shoot',
  'Product Shoot',
  'Catalog-grade packshots that read real, not synthetic.',
  'A repeatable playbook for hero product frames — surface truth, believable shadows, and lens choices that match how buyers actually see the SKU.',
  'photography',
  'landscape',
  'Treat the product like talent: one hero angle, one supporting angle, one detail. Your job is to sell material (glass, metal, fabric) without the image screaming "render".',
  E'Camera body: full-frame or medium format look.\nAngle: eye-level or 5–10° above (never extreme worm''s-eye).\nTripod: locked. Shutter: 1/125+ if mixing ambient; otherwise studio sync.\nAperture: f/8–f/11 for edge-to-edge sharpness on packshots.',
  E'Key: large soft source 45° camera-left, feathered across the face of the product.\nFill: white bounce or 1-stop weaker fill camera-right.\nRim: narrow strip or snoot for separation on dark SKUs.\nAvoid: double shadows, neon color casts, "AI glow" on edges.',
  E'Lens: 85mm or 100mm macro-capable for details.\nFocal length on crop: ~50–70mm equivalent.\nDistance: back off until distortion disappears; crop in post, not in prompt.\nFocus: single plane on front label / logo.',
  E'Negative space for copy. Rule of thirds for hero; center-weighted for symmetry SKUs.\nLeading lines from surface texture toward logo.\nOne prop max — otherwise the frame reads like a mood board, not a product shot.',
  E'Neutral white balance. Slight warm grade (+3–5) for luxury; cool for tech.\nSaturation: restrained — let material do the work.\nBackground: seamless paper, acrylic, or believable tabletop — never "void".',
  '[
    {"title":"Lock the brief","body":"SKU, material, mandatory logo angle, background color, export aspect (1:1, 4:5, 16:9)."},
    {"title":"Build the set","body":"Surface + backdrop + flags to kill spill. Shoot a grey card reference."},
    {"title":"Light for material","body":"Move key until highlight reads true on metal/glass; add polarizer logic in prompt for glass."},
    {"title":"Hero + detail","body":"One full product frame, one macro (texture/stitching/cap)."},
    {"title":"Grade & export","body":"Match white point across set; export sRGB for web, wider gamut archive."}
  ]'::jsonb,
  array['Midjourney v6', 'Flux', 'Photoshop Generative Fill'],
  E'Subject: [product] on [surface], [material emphasis].\nCamera: 85mm, f/8, tripod, slight 8° overhead.\nLighting: large soft key 45° left, subtle fill right, rim for separation.\nEnvironment: [backdrop], realistic contact shadow, no floating object.\nStyle: commercial product photography, not illustration — believable imperfections, label sharp.',
  'Name the material. Ban words like "hyper-detailed 8K masterpiece". Specify shadow contact and lens mm.',
  'Floating products, duplicate shadows, impossible reflections, warped logos, plastic skin on non-skin objects.',
  true, true, 10
),
(
  'trailer-cut',
  'Trailer Cut',
  'Pacing-first beats for 15–60s AI video assemblies.',
  'Think like an editor before you prompt: establish, escalate, sting. This module is for rhythm, shot grammar, and model handoffs — not random B-roll.',
  'video',
  'landscape',
  'Trailers are math: hook in 3 seconds, act breaks every 8–12 seconds, audio-led energy even when silent on platform.',
  E'Aspect: 2.39:1 or 16:9 master; vertical cutdowns reframed, not regen.\nShutter: 180° rule (24fps → 1/48) for cinematic motion blur.\nHandheld: only for documentary beats; otherwise locked or slider.',
  E'High contrast, motivated practicals, silhouette-friendly backlight.\nStrobe only as punctuation — not every shot.\nColor script: cool establish → warm turn → neutral sting.',
  E'Lens story: wide establish (24–28mm), medium coverage (35–50mm), portrait intimacy (65–85mm), macro insert for objects.\nMatch eyelines across cuts; cheat geography on purpose, not by accident.',
  E'Center weight for logos/titles. Off-center for tension.\nMotion toward frame edge = unease; toward center = resolution.\nCut on action; hide AI morphs behind whip or light flash.',
  E'Teal/orange sparingly. Crush blacks on genre; lift for comedy.\nGrain: fine 35mm for prestige; clean for tech.',
  '[
    {"title":"Beat map","body":"3s hook, 8s turn, 15s mid, sting. Write one line per beat before prompting."},
    {"title":"Shot list","body":"Establish wide, character medium, insert macro, reaction close."},
    {"title":"Generate plates","body":"Image model for keyframes; video model for motion between approved stills."},
    {"title":"Assembly","body":"Cut on music transient; J/L cuts for dialogue; sound design before color."},
    {"title":"Finishing","body":"Legalize loudness; add 2.39 matte; export platform variants."}
  ]'::jsonb,
  array['Kling', 'Runway Gen-3', 'Higgsfield', 'DaVinci Resolve'],
  E'Beat [n]/[total]: [shot type], [lens]mm, [camera move].\nLighting: [motivated source], [mood].\nAction: [subject verb] in [environment].\nDuration: [seconds]s, [fps]fps, cinematic motion blur, no morphing faces.',
  'Lock wardrobe and face reference per character ID. Reuse seed/frame-refs between shots.',
  'Face drift, extra fingers in hero frames, inconsistent time-of-day, unmotivated camera spins, every shot same focal length.',
  true, true, 20
),
(
  'poster-design',
  'Poster Design',
  'One-sheet hierarchy: star, title, tone — readable at thumb size.',
  'Poster work is graphic design with a cinematographer''s eye. You are balancing likeness, type, and negative space for bus stops and phone screens.',
  'design',
  'portrait',
  'If the thumbnail is illegible, the poster failed. Build for 3-meter read, then reward the 30cm view.',
  E'Not a single capture — composite thinking. Shoot/portrait plate separately from environment plate when needed.\nSafe zones: title bottom third, billing block reserved, faces upper two-thirds.',
  E'Rim subject hard against environment. Graduated vignette, not flat HDR.\nSeparate subject and BG relight passes for control.',
  E'Portrait lens language even in illustration: 50–85mm equivalent face rendering.\nAvoid wide-angle face stretch in hero portraits.',
  E'Title drives scale. Face drives emotion. Tagline is optional — don''t compete.\nSymmetry for prestige; asymmetry for thriller/horror.',
  E'Limited palette (2–3 colors + neutrals). One accent for title or rating badge.',
  '[
    {"title":"Thumbnail test","body":"Blur to 64px wide — can you read title and feel genre?"},
    {"title":"Plate generation","body":"Subject on neutral, environment as separate plate or painted sky."},
    {"title":"Type system","body":"Pick display + supporting; track kerning for all-caps titles."},
    {"title":"Composite","body":"Grain match, noise match, shared light direction across layers."},
    {"title":"Deliverables","body":"27x40, A2, social 4:5, streaming 16:9 key art variants."}
  ]'::jsonb,
  array['Midjourney', 'Photoshop', 'Ideogram', 'Figma'],
  E'One-sheet poster, [genre] tone.\nSubject: [character] lit from [direction], rim light, 85mm portrait feel.\nBackground: [environment] simplified for readability.\nTitle treatment: [upper/lower] third, [type style], high contrast.\nNo watermark, no collage clutter, print-ready hierarchy.',
  'Describe title placement and genre in the same prompt. Ban tiny illegible type.',
  'Busy backgrounds behind faces, glowing halos, floating title with no perspective, mixed lighting directions on composite layers.',
  true, false, 30
);
