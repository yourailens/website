import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();
mkdirSync("public/videos/ott-posters", { recursive: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("missing supabase env");
  process.exit(1);
}

const db = createClient(url, key);
const { data, error } = await db
  .from("ott_cuts")
  .select("slug,caption,media_type,media_url,poster_url,category,published")
  .eq("published", true)
  .in("category", ["ads", "films"]);

if (error) {
  console.error(error);
  process.exit(1);
}

const cuts = data || [];
console.log("cuts", cuts.length);

for (const cut of cuts) {
  const out = `public/videos/ott-posters/${cut.slug}-poster.jpg`;
  if (cut.poster_url) {
    console.log("db poster", cut.slug);
    continue;
  }
  if (cut.media_type === "image") {
    console.log("image media", cut.slug);
    continue;
  }
  if (existsSync(out)) {
    console.log("skip", out);
    continue;
  }
  const media = cut.media_url;
  if (!media) continue;
  console.log("extract", cut.slug);
  let r = spawnSync(
    "/opt/homebrew/bin/ffmpeg",
    ["-y", "-hide_banner", "-loglevel", "error", "-ss", "1", "-i", media, "-frames:v", "1", "-q:v", "3", out],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    r = spawnSync(
      "/opt/homebrew/bin/ffmpeg",
      ["-y", "-hide_banner", "-loglevel", "error", "-i", media, "-ss", "0.3", "-frames:v", "1", "-q:v", "3", out],
      { encoding: "utf8" }
    );
  }
  if (r.status !== 0) console.log("FAIL", cut.slug, (r.stderr || "").slice(0, 240));
  else console.log("ok", out);
}
