-- ============================================================
-- Sample Prompts – paste into Supabase SQL editor to seed data
-- ============================================================

insert into public.prompts (
  slug, title, excerpt, cover_image_url, cover_aspect, media_type,
  image_category, video_category, difficulty, models, tags,
  body, featured, published, sort_order
) values

-- ── 1. Hyper-realistic portrait ───────────────────────────────
(
  'hyperrealistic-portrait-midjourney-v6',
  'Hyper-realistic Portrait Workflow with Midjourney v6',
  'A complete step-by-step workflow for generating studio-quality AI portraits that look indistinguishable from real photography.',
  null,
  'portrait',
  'image',
  'ultrarealistic',
  null,
  'intermediate',
  ARRAY['Midjourney'],
  ARRAY['portrait', 'ultrarealistic', 'lighting', 'skin texture', 'fashion'],
  E'# Hyper-realistic Portrait Workflow\n\nThis workflow walks you through generating studio-quality AI portraits using Midjourney v6. The goal is photographic accuracy — skin texture, catch lights, and natural depth.\n\n## Step 1 — Base Prompt Structure\n\nStart with a strong subject description. Always specify **ethnicity, age range, and mood** — these anchor the generation.\n\n```prompt\nclose-up portrait of a 24-year-old South Indian woman, natural makeup, soft studio light, looking directly at camera, fashion editorial, sharp focus --ar 3:4 --v 6.1 --style raw\n```\n\n## Step 2 — Lighting Control\n\nLighting makes or breaks portrait realism. Use one of these proven setups:\n\n- **Rembrandt light** – dramatic, one side lit, triangle on cheek\n- **Ring light** – even, commercial, bright catch-lights\n- **Golden hour** – warm, cinematic, soft shadows\n- **Studio softbox** – clean, professional, neutral\n\n> Pro tip: Always add `--style raw` in v6 to reduce the "AI painterly" look and push toward photograph realism.\n\n## Step 3 — Skin & Detail Pass\n\nAfter the base generation, upscale with:\n\n```prompt\n[previous generation] :: skin pores visible, subsurface scattering, 8k, Sony A7R V, 85mm f/1.4 lens --upbeta\n```\n\n## Step 4 — Final Refinement\n\nAdd these suffixes to push quality:\n\n- `shot on film` – adds grain + organic imperfections\n- `VSCO preset` – consistent colour grading\n- `Vogue editorial lighting` – prestige feel\n\n---\n\n## Full Prompt (Copy-Ready)\n\n```prompt\nclose-up portrait of a 24-year-old South Indian woman, natural makeup, Rembrandt lighting, fashion editorial, skin pores visible, subsurface scattering, Sony A7R V 85mm f/1.4, sharp focus, Vogue editorial --ar 3:4 --v 6.1 --style raw --q 2\n```',
  true,
  true,
  100
),

-- ── 2. AI Product Ad Film ─────────────────────────────────────
(
  'product-ad-film-kling-ai',
  'Cinematic Product Ad Film — Kling AI + Higgsfield',
  'How to create a premium 15-second product ad video using AI video generation tools, from concept to final cut.',
  null,
  'landscape',
  'video',
  null,
  'cinematic',
  'intermediate',
  ARRAY['Kling AI', 'Higgsfield', 'Runway'],
  ARRAY['product', 'ad film', 'cinematic', 'luxury', 'brand'],
  E'# Cinematic Product Ad Film Workflow\n\nThis is the exact workflow we use at YourAILens Studios to produce 15-second product films for brands — entirely with AI.\n\n## The Structure\n\nEvery great product ad has this skeleton:\n\n1. **Hook** (0–3s) – unexpected visual that stops the scroll\n2. **Product reveal** (3–8s) – slow, beautiful close-up\n3. **Use-case** (8–12s) – human interaction with product\n4. **CTA frame** (12–15s) – logo + tagline\n\n## Step 1 — Generate the Hero Shot (Kling AI)\n\nStart with a still image in the exact framing you want for the product reveal.\n\n```prompt\na luxury perfume bottle floating in mid-air, dark background, dramatic side lighting, macro lens, product photography, cinematic --ar 16:9\n```\n\nThen animate it in **Kling AI** with:\n\n```motion prompt\ncamera slowly pulls back, bottle rotates 15 degrees, light sweeps across bottle surface, cinematic motion\n```\n\n## Step 2 — Human Interaction Shot (Higgsfield)\n\nFor the use-case scene, use **Higgsfield** which handles human motion best:\n\n```prompt\nyoung Indian woman in white dress picks up perfume bottle, sprays lightly, smiles subtly, golden hour window light, handheld camera feel, slow motion\n```\n\n> Keep the talent brief simple — Higgsfield generates best when motion is limited to hand and face.\n\n## Step 3 — Hook Shot (Runway)\n\nUse **Runway Gen-3** for abstract or high-FX hook shots:\n\n```prompt\nliquid gold pours in slow motion forming the shape of the perfume bottle, black background, dramatic lighting, 4K\n```\n\n## Step 4 — Edit Together\n\nCombine all three clips in any editor. Apply:\n\n- Colour grade: desaturate slightly, push warm tones\n- Sound: use a royalty-free cinematic score\n- Text: minimal, serif font, fades in at 12s\n\n---\n\n## Full Shot List\n\n| Shot | Tool | Duration | Notes |\n| --- | --- | --- | --- |\n| Hook | Runway Gen-3 | 3s | Gold liquid abstract |\n| Product reveal | Kling AI | 5s | Slow rotate + light sweep |\n| Use-case | Higgsfield | 4s | Human spraying perfume |\n| CTA | Static / text | 3s | Logo overlay |',
  true,
  true,
  90
),

-- ── 3. Anime illustration ─────────────────────────────────────
(
  'anime-character-flux-schnell',
  '2D Anime Character Sheet — Flux Schnell',
  'Generate consistent anime-style character sheets with multiple poses using Flux Schnell. Perfect for animated series concepts.',
  null,
  'portrait',
  'image',
  '2d_illustration',
  null,
  'beginner',
  ARRAY['Flux'],
  ARRAY['anime', '2d', 'character design', 'illustration', 'consistent'],
  E'# 2D Anime Character Sheet Workflow\n\nThis workflow generates a multi-pose anime character sheet for a single character — essential for anyone building an animated series or game.\n\n## Why Flux Schnell for Anime?\n\n**Flux Schnell** (via Fal.ai or Replicate) consistently handles anime aesthetics better than Midjourney for 2D illustration work. It respects line-weight, flat colour fills, and cel-shading.\n\n## Step 1 — Define Your Character\n\nBefore prompting, write a character bible (2–3 lines):\n\n- Name, age, personality\n- Signature outfit (specific colours, materials)\n- One signature accessory\n\n## Step 2 — Front-facing Base\n\n```prompt\nanime character sheet, young Indian girl, 18 years old, dark wavy hair with blue streaks, wearing oversized white hoodie and black shorts, sneakers, simple flat background, front view, full body, clean linework, cel-shaded, studio ghibli style --ar 2:3\n```\n\n## Step 3 — Lock the Seed\n\nOnce you get a face you like, **note the seed number** and reuse it for all subsequent poses:\n\n```prompt\n[same prompt] + left side view, same character, same outfit --seed [YOUR_SEED]\n```\n\n## Step 4 — Expressions Sheet\n\n```prompt\nanime expression sheet, [character description], 6 expressions: happy, sad, angry, surprised, thinking, mischievous, white background, chibi-style heads only\n```\n\n> This is the most-used asset in animation pre-production. Clients love seeing expressions before full production.\n\n---\n\n## Quick Reference Modifiers\n\n- `flat colour fill` – no gradients, pure 2D look\n- `thick outline` – readable at small sizes\n- `white background` – easy to extract in post\n- `model sheet` – triggers pose variety',
  false,
  true,
  80
),

-- ── 4. Lip sync workflow ──────────────────────────────────────
(
  'ai-avatar-lip-sync-seedance',
  'AI Avatar Lip Sync Workflow — Seedance + ElevenLabs',
  'End-to-end workflow: generate a speaking AI avatar from a photo, add AI voiceover, and sync lips — all without filming.',
  null,
  'landscape',
  'video',
  null,
  'lip_sync',
  'advanced',
  ARRAY['Seedance', 'ElevenLabs', 'Kling AI'],
  ARRAY['lip sync', 'avatar', 'voiceover', 'talking head', 'brand spokesperson'],
  E'# AI Avatar Lip Sync Workflow\n\nThis is the full production pipeline for creating a talking AI brand spokesperson — photo → voice → lip sync → final video.\n\n## Tools in This Stack\n\n- **ElevenLabs** – AI voice cloning / text-to-speech\n- **Kling AI** – reference image to video generation\n- **Seedance** – lip sync layer\n\n## Step 1 — Generate the Base Portrait\n\nFirst, create a high-quality frontal portrait (or use a real photo). The face must be:\n\n- Front-facing (less than 15° angle)\n- Well-lit, no harsh shadows\n- Mouth slightly closed or neutral\n\n```prompt\nprofessional headshot of a 28-year-old Indian woman, confident expression, subtle smile, white background, soft studio lighting, Sony 85mm, sharp focus --ar 1:1 --style raw\n```\n\n## Step 2 — Generate the Voice (ElevenLabs)\n\n1. Go to **ElevenLabs → Text to Speech**\n2. Choose a voice that matches your character\'s personality\n3. Paste your script (keep it under 60 seconds for best results)\n4. Set **Stability: 0.5**, **Similarity: 0.75**\n5. Export as **MP3 / WAV**\n\n> For brand consistency, clone a real voice using ElevenLabs Voice Cloning with 10 minutes of clean audio.\n\n## Step 3 — Animate the Portrait (Kling AI)\n\nUpload your portrait to Kling AI with this motion prompt:\n\n```motion prompt\nperson talking naturally, subtle head nods, blinks occasionally, calm and confident expression, studio environment\n```\n\nGenerate a 5–8 second base loop. This becomes your "talking base".\n\n## Step 4 — Sync Lips (Seedance)\n\n1. Upload the **talking base video** to Seedance\n2. Upload your **voiceover audio**\n3. Select **Auto lip sync** mode\n4. Seedance aligns mouth movements to your audio\n\n## Step 5 — Final Polish\n\n- Add lower-third text (name + title) in your brand font\n- Color grade to match brand palette\n- Add subtle background music at -20dB under voice\n\n---\n\n## Checklist Before Delivery\n\n- [ ] Face is front-facing and well lit\n- [ ] Voice matches character age and personality\n- [ ] Lip sync latency < 2 frames\n- [ ] No visible AI artefacts on mouth area\n- [ ] Audio peaks at -6dB max',
  true,
  true,
  95
);
