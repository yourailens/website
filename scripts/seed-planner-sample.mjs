/**
 * Loads supabase/migrations/089_planner_sample.sql through the service role API.
 * Same rows as the SQL file. Does not print secrets.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const HASH =
  "scrypt:ced2ee64c10316d45d406e7af230e4d1:90df2df38372f2887a8164aa0f3669504f13fd969346e60dd4a2d8a490fe8294248f0ec4e3a5651817465674a10f76816c61ba1ed5f6563dfc3ea21b9595f96c";

const MIRA = "a1111111-1111-4111-8111-111111111111";
const ARJUN = "a2222222-2222-4222-8222-222222222222";
const LEELA = "a3333333-3333-4333-8333-333333333333";
const NOAH = "a4444444-4444-4444-8444-444444444444";

const TASKS = [
  "b1000000-0000-4000-8000-000000000001",
  "b1000000-0000-4000-8000-000000000002",
  "b1000000-0000-4000-8000-000000000003",
  "b1000000-0000-4000-8000-000000000004",
  "b1000000-0000-4000-8000-000000000005",
  "b1000000-0000-4000-8000-000000000006",
  "b1000000-0000-4000-8000-000000000007",
  "b1000000-0000-4000-8000-000000000008",
];
const CONTACTS = [
  "c1000000-0000-4000-8000-000000000001",
  "c1000000-0000-4000-8000-000000000002",
  "c1000000-0000-4000-8000-000000000003",
  "c1000000-0000-4000-8000-000000000004",
];
const MEETINGS = [
  "e1000000-0000-4000-8000-000000000001",
  "e1000000-0000-4000-8000-000000000002",
  "e1000000-0000-4000-8000-000000000003",
];
const POSTS = [
  "f1000000-0000-4000-8000-000000000001",
  "f1000000-0000-4000-8000-000000000002",
  "f1000000-0000-4000-8000-000000000003",
  "f1000000-0000-4000-8000-000000000004",
  "f1000000-0000-4000-8000-000000000005",
];
const NOTES = [
  "91000000-0000-4000-8000-000000000001",
  "91000000-0000-4000-8000-000000000002",
  "91000000-0000-4000-8000-000000000003",
  "91000000-0000-4000-8000-000000000004",
  "91000000-0000-4000-8000-000000000005",
];

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString();
}
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function check(label, error) {
  if (error) {
    console.error(label, error.message);
    process.exit(1);
  }
}

const members = [
  {
    id: MIRA,
    email: "mira.sample@yourailens.studio",
    password_hash: HASH,
    display_name: "Mira Kapoor",
    slug: "mira-sample",
    role_title: "Producer",
    is_ceo: false,
    active: true,
    bio: "Runs the shoot calendar, client calls, and who is on set.",
  },
  {
    id: ARJUN,
    email: "arjun.sample@yourailens.studio",
    password_hash: HASH,
    display_name: "Arjun Mehta",
    slug: "arjun-sample",
    role_title: "Editor",
    is_ceo: false,
    active: true,
    bio: "Cuts trailers, product films, and the weekly social edits.",
  },
  {
    id: LEELA,
    email: "leela.sample@yourailens.studio",
    password_hash: HASH,
    display_name: "Leela Shah",
    slug: "leela-sample",
    role_title: "Strategist",
    is_ceo: false,
    active: true,
    bio: "Owns follow ups, pitches, and what the client actually asked for.",
  },
  {
    id: NOAH,
    email: "noah.sample@yourailens.studio",
    password_hash: HASH,
    display_name: "Noah Iyer",
    slug: "noah-sample",
    role_title: "Designer",
    is_ceo: false,
    active: true,
    bio: "Frames, titles, and the look of the deck before it goes out.",
  },
];

check("members", (await db.from("planner_members").upsert(members, { onConflict: "email" })).error);

const { data: ceos, error: ceoErr } = await db
  .from("planner_members")
  .select("id, email, is_ceo, created_at")
  .eq("is_ceo", true)
  .order("created_at");
check("ceo", ceoErr);
const ceo = (ceos ?? []).find((m) => !String(m.email).endsWith(".sample@yourailens.studio")) ?? null;

check("attendees", (await db.from("planner_meeting_attendees").delete().in("meeting_id", MEETINGS)).error);
check("entries", (await db.from("planner_contact_entries").delete().in("contact_id", CONTACTS)).error);
check("tasks", (await db.from("planner_tasks").delete().in("id", TASKS)).error);
check("contacts", (await db.from("planner_contacts").delete().in("id", CONTACTS)).error);
check("meetings", (await db.from("planner_meetings").delete().in("id", MEETINGS)).error);
check("posts", (await db.from("planner_posts").delete().in("id", POSTS)).error);
check("notes", (await db.from("planner_notes").delete().in("id", NOTES)).error);

const tasks = [
  {
    id: TASKS[0],
    title: "Cut the YAILIANS teaser to 30 seconds",
    notes: "Open on the corridor shot. End on the title card. Send a link before Thursday.",
    deadline: daysFromNow(3),
    status: "doing",
    created_by: ARJUN,
    assignee_id: ARJUN,
    sort_order: 80,
    created_at: hoursFromNow(-48),
  },
  {
    id: TASKS[1],
    title: "Confirm the Friday shoot crew",
    notes: "Need camera, art, and a runner. Location is still the studio floor.",
    deadline: daysFromNow(1),
    status: "open",
    created_by: MIRA,
    assignee_id: MIRA,
    sort_order: 70,
    created_at: hoursFromNow(-24),
  },
  {
    id: TASKS[2],
    title: "Send the Northwind pitch deck",
    notes: "Leela has the story. Noah has the frames. Do not send until both are in.",
    deadline: daysFromNow(2),
    status: "blocked",
    created_by: LEELA,
    assignee_id: LEELA,
    sort_order: 60,
    created_at: hoursFromNow(-6),
  },
  {
    id: TASKS[3],
    title: "Title cards for the vault rail",
    notes: "Three films. Short titles. White type on the still.",
    deadline: daysFromNow(-1),
    status: "done",
    created_by: NOAH,
    assignee_id: NOAH,
    sort_order: 50,
    created_at: hoursFromNow(-96),
  },
  {
    id: TASKS[4],
    title: "Write the Monday call notes",
    notes: "What they asked, what we promised, and the next call time.",
    deadline: daysFromNow(1),
    status: "doing",
    created_by: LEELA,
    assignee_id: MIRA,
    sort_order: 40,
    created_at: hoursFromNow(-5),
  },
  {
    id: TASKS[5],
    title: "Pack the product film kit",
    notes: "Lens set, bounce, and the extra battery case.",
    deadline: daysFromNow(4),
    status: "open",
    created_by: MIRA,
    assignee_id: NOAH,
    sort_order: 30,
    created_at: hoursFromNow(-3),
  },
];
if (ceo) {
  tasks.push(
    {
      id: TASKS[6],
      title: "Review the sample deck",
      notes: "Look at Northwind and say if the pitch is ready to send.",
      deadline: daysFromNow(2),
      status: "open",
      created_by: ceo.id,
      assignee_id: ceo.id,
      sort_order: 90,
      created_at: hoursFromNow(-0.5),
    },
    {
      id: TASKS[7],
      title: "Call Northwind about the cut",
      notes: "They want a shorter open. Mira has the time.",
      deadline: daysFromNow(1),
      status: "doing",
      created_by: ceo.id,
      assignee_id: ceo.id,
      sort_order: 85,
      created_at: hoursFromNow(-0.3),
    },
  );
}
check("insert tasks", (await db.from("planner_tasks").insert(tasks)).error);

check(
  "insert contacts",
  (
    await db.from("planner_contacts").insert([
      {
        id: CONTACTS[0],
        name: "Aisha Rahman",
        company: "Northwind Beauty",
        role_title: "Brand lead",
        phone: "+91 98450 11021",
        email: "aisha@northwind.example",
        website: "https://northwind.example",
        notes: "Warm lead. Likes short films more than static posts.",
        contacted: true,
        status: "active",
        next_follow_up_at: hoursFromNow(24),
        requirement: "A 30 second film and three cutdowns for their launch week.",
        pitch: "Studio made film, not an ad that looks like an ad. YAILIANS tone, quieter grade.",
        owner_id: LEELA,
        created_by: LEELA,
        created_at: hoursFromNow(-120),
      },
      {
        id: CONTACTS[1],
        name: "Rohan Desai",
        company: "Lumen Foods",
        role_title: "Marketing head",
        phone: "+91 98200 44118",
        email: "rohan@lumen.example",
        website: "https://lumen.example",
        notes: "Inbound from the site. Has not been called yet.",
        contacted: false,
        status: "new",
        next_follow_up_at: hoursFromNow(72),
        requirement: "A product film for a new snack line, plus stills.",
        pitch: "One day shoot, tabletop, and a founder line at the end.",
        owner_id: MIRA,
        created_by: MIRA,
        created_at: hoursFromNow(-24),
      },
      {
        id: CONTACTS[2],
        name: "Priya Nair",
        company: "Halcyon Hotels",
        role_title: "Creative director",
        phone: "+91 99000 22841",
        email: "priya@halcyon.example",
        website: "https://halcyon.example",
        notes: "Signed. First film is the lobby at dusk.",
        contacted: true,
        status: "won",
        next_follow_up_at: hoursFromNow(240),
        requirement: "A brand film and a set of room films for the site.",
        pitch: "Quiet camera, real guests, no stock music.",
        owner_id: MIRA,
        created_by: LEELA,
        created_at: hoursFromNow(-288),
      },
      {
        id: CONTACTS[3],
        name: "Dev Kapoor",
        company: "Orbit Mobility",
        role_title: "Founder",
        phone: "+91 98111 90332",
        email: "dev@orbit.example",
        website: "https://orbit.example",
        notes: "Paused until their funding round closes.",
        contacted: true,
        status: "paused",
        next_follow_up_at: hoursFromNow(504),
        requirement: "A launch film for an electric scooter.",
        pitch: "Night city, one rider, product only in the last shot.",
        owner_id: LEELA,
        created_by: LEELA,
        created_at: hoursFromNow(-480),
      },
    ])
  ).error,
);

check(
  "insert entries",
  (
    await db.from("planner_contact_entries").insert([
      {
        id: "d1000000-0000-4000-8000-000000000001",
        contact_id: CONTACTS[0],
        kind: "contacted",
        body: "Called Aisha. She watched the vault reel and asked for something in that tone.",
        created_by: LEELA,
        created_at: hoursFromNow(-96),
      },
      {
        id: "d1000000-0000-4000-8000-000000000002",
        contact_id: CONTACTS[0],
        kind: "ask",
        body: "They asked if we can deliver a 15 second cut and a 6 second cut with the same grade.",
        created_by: LEELA,
        created_at: hoursFromNow(-95.8),
      },
      {
        id: "d1000000-0000-4000-8000-000000000003",
        contact_id: CONTACTS[0],
        kind: "requirement",
        body: "Launch week is the first week of next month. Hero film plus three cutdowns.",
        created_by: LEELA,
        created_at: hoursFromNow(-72),
      },
      {
        id: "d1000000-0000-4000-8000-000000000004",
        contact_id: CONTACTS[0],
        kind: "pitch",
        body: "Pitched a one day studio shoot and a corridor scene, no voiceover.",
        created_by: LEELA,
        created_at: hoursFromNow(-71.6),
      },
      {
        id: "d1000000-0000-4000-8000-000000000005",
        contact_id: CONTACTS[0],
        kind: "scheduled",
        body: "Next call to walk the deck and lock the shoot date.",
        scheduled_at: hoursFromNow(24),
        created_by: LEELA,
        created_at: hoursFromNow(-48),
      },
      {
        id: "d1000000-0000-4000-8000-000000000006",
        contact_id: CONTACTS[2],
        kind: "outcome",
        body: "Priya approved the treatment. Contract is with their finance team.",
        created_by: MIRA,
        created_at: hoursFromNow(-192),
      },
      {
        id: "d1000000-0000-4000-8000-000000000007",
        contact_id: CONTACTS[1],
        kind: "next",
        body: "First call. Ask about the snack line, the talent, and whether they have a kitchen we can use.",
        created_by: MIRA,
        created_at: hoursFromNow(-24),
      },
    ])
  ).error,
);

check(
  "insert meetings",
  (
    await db.from("planner_meetings").insert([
      {
        id: MEETINGS[0],
        title: "Monday studio standup",
        notes: "Teaser is in picture lock. Northwind deck is the blocker. Noah sends frames tonight.",
        starts_at: hoursFromNow(-48),
        ends_at: hoursFromNow(-47.3),
        created_by: MIRA,
        created_at: hoursFromNow(-48),
      },
      {
        id: MEETINGS[1],
        title: "Northwind brand call",
        notes: "Walk the deck. Confirm the 30 second length. Ask who approves the grade.",
        starts_at: hoursFromNow(24),
        ends_at: hoursFromNow(24.75),
        created_by: LEELA,
        created_at: hoursFromNow(-24),
      },
      {
        id: MEETINGS[2],
        title: "Edit review",
        notes: "Watch the teaser together. Note the two shots Arjun still wants to swap.",
        starts_at: hoursFromNow(4),
        ends_at: hoursFromNow(5),
        created_by: ARJUN,
        created_at: hoursFromNow(-3),
      },
    ])
  ).error,
);

const attendees = [
  [MEETINGS[0], MIRA],
  [MEETINGS[0], ARJUN],
  [MEETINGS[0], LEELA],
  [MEETINGS[0], NOAH],
  [MEETINGS[1], LEELA],
  [MEETINGS[1], MIRA],
  [MEETINGS[2], ARJUN],
  [MEETINGS[2], NOAH],
];
if (ceo) {
  attendees.push([MEETINGS[0], ceo.id], [MEETINGS[1], ceo.id]);
}
check(
  "insert attendees",
  (
    await db.from("planner_meeting_attendees").upsert(
      attendees.map(([meeting_id, member_id]) => ({ meeting_id, member_id })),
      { onConflict: "meeting_id,member_id" },
    )
  ).error,
);

const posts = [
  {
    id: POSTS[0],
    author_id: MIRA,
    body: "Friday shoot is on the studio floor. Crew list is almost locked. If you are in, tell me today.",
    created_at: hoursFromNow(-5),
  },
  {
    id: POSTS[1],
    author_id: ARJUN,
    body: "Teaser picture lock is close. The corridor shot stays. I am still swapping the last two cuts.",
    created_at: hoursFromNow(-3),
  },
  {
    id: POSTS[2],
    author_id: LEELA,
    body: "Northwind wants the deck before the call tomorrow. Pitch is the quiet film, not a loud ad.",
    created_at: hoursFromNow(-2),
  },
  {
    id: POSTS[3],
    author_id: NOAH,
    body: "Vault rail titles are in. White type, short names, no extra lines.",
    created_at: hoursFromNow(-1),
  },
];
if (ceo) {
  posts.push({
    id: POSTS[4],
    author_id: ceo.id,
    body: "Sample week is in the planner. Look through tasks, follow ups, and each person page before we add real work.",
    created_at: hoursFromNow(-0.25),
  });
}
check("insert posts", (await db.from("planner_posts").insert(posts)).error);

const notes = [
  {
    id: NOTES[0],
    member_id: MIRA,
    author_id: MIRA,
    title: "Shoot day running notes",
    body: "Call time is 8. Floor is studio B.\nArt arrives with the product table.\nClient is not on set. Send stills at lunch.",
    created_at: hoursFromNow(-24),
    updated_at: hoursFromNow(-24),
  },
  {
    id: NOTES[1],
    member_id: ARJUN,
    author_id: ARJUN,
    title: "Teaser cut notes",
    body: "Open: corridor, 4 seconds.\nMiddle: hands, then the turn.\nEnd: title, hold, no music sting.\nStill need a cleaner room tone.",
    created_at: hoursFromNow(-6),
    updated_at: hoursFromNow(-6),
  },
  {
    id: NOTES[2],
    member_id: LEELA,
    author_id: LEELA,
    title: "Northwind requirements",
    body: "They asked for 30, 15, and 6 seconds.\nNo voiceover.\nGrade should feel like the vault films.\nApproval sits with Aisha, then their founder.",
    created_at: hoursFromNow(-72),
    updated_at: hoursFromNow(-72),
  },
  {
    id: NOTES[3],
    member_id: NOAH,
    author_id: NOAH,
    title: "Deck frames",
    body: "Three stills only.\nTitle in Comfortaa, white, left aligned.\nDo not add a logo lockup on the film frames.",
    created_at: hoursFromNow(-8),
    updated_at: hoursFromNow(-8),
  },
];
if (ceo) {
  notes.push({
    id: NOTES[4],
    member_id: ceo.id,
    author_id: ceo.id,
    title: "This week",
    body: "Review the Northwind deck.\nSit in the edit review.\nPeople pages are under People in the sidebar.",
    created_at: hoursFromNow(-0.2),
    updated_at: hoursFromNow(-0.2),
  });
}
check("insert notes", (await db.from("planner_notes").insert(notes)).error);

console.log(`seeded sample planner data${ceo ? " including the existing CEO" : ""}`);
