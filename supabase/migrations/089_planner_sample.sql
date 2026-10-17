-- ============================================================
-- 089 · Planner sample data
-- Run in the Supabase SQL editor after 088_planner.sql.
-- Safe to run again. It refreshes these sample rows only.
-- Your existing login, password, and anything you already
-- created stay as they are.
--
-- Sample teammates sign in at /planner/login
--   mira.sample@yourailens.studio
--   arjun.sample@yourailens.studio
--   leela.sample@yourailens.studio
--   noah.sample@yourailens.studio
-- Password for all four: sample123
-- ============================================================

-- Teammates ---------------------------------------------------------------
insert into public.planner_members (
  id, email, password_hash, display_name, slug, role_title, is_ceo, active, bio
) values
  (
    'a1111111-1111-4111-8111-111111111111',
    'mira.sample@yourailens.studio',
    'scrypt:ced2ee64c10316d45d406e7af230e4d1:90df2df38372f2887a8164aa0f3669504f13fd969346e60dd4a2d8a490fe8294248f0ec4e3a5651817465674a10f76816c61ba1ed5f6563dfc3ea21b9595f96c',
    'Mira Kapoor',
    'mira-sample',
    'Producer',
    false,
    true,
    'Runs the shoot calendar, client calls, and who is on set.'
  ),
  (
    'a2222222-2222-4222-8222-222222222222',
    'arjun.sample@yourailens.studio',
    'scrypt:ced2ee64c10316d45d406e7af230e4d1:90df2df38372f2887a8164aa0f3669504f13fd969346e60dd4a2d8a490fe8294248f0ec4e3a5651817465674a10f76816c61ba1ed5f6563dfc3ea21b9595f96c',
    'Arjun Mehta',
    'arjun-sample',
    'Editor',
    false,
    true,
    'Cuts trailers, product films, and the weekly social edits.'
  ),
  (
    'a3333333-3333-4333-8333-333333333333',
    'leela.sample@yourailens.studio',
    'scrypt:ced2ee64c10316d45d406e7af230e4d1:90df2df38372f2887a8164aa0f3669504f13fd969346e60dd4a2d8a490fe8294248f0ec4e3a5651817465674a10f76816c61ba1ed5f6563dfc3ea21b9595f96c',
    'Leela Shah',
    'leela-sample',
    'Strategist',
    false,
    true,
    'Owns follow ups, pitches, and what the client actually asked for.'
  ),
  (
    'a4444444-4444-4444-8444-444444444444',
    'noah.sample@yourailens.studio',
    'scrypt:ced2ee64c10316d45d406e7af230e4d1:90df2df38372f2887a8164aa0f3669504f13fd969346e60dd4a2d8a490fe8294248f0ec4e3a5651817465674a10f76816c61ba1ed5f6563dfc3ea21b9595f96c',
    'Noah Iyer',
    'noah-sample',
    'Designer',
    false,
    true,
    'Frames, titles, and the look of the deck before it goes out.'
  )
on conflict (email) do update set
  display_name = excluded.display_name,
  slug = excluded.slug,
  role_title = excluded.role_title,
  bio = excluded.bio,
  active = true,
  password_hash = excluded.password_hash;

-- Refresh sample rows -----------------------------------------------------
delete from public.planner_meeting_attendees
 where meeting_id in (
   'e1000000-0000-4000-8000-000000000001',
   'e1000000-0000-4000-8000-000000000002',
   'e1000000-0000-4000-8000-000000000003'
 );

delete from public.planner_contact_entries
 where contact_id in (
   'c1000000-0000-4000-8000-000000000001',
   'c1000000-0000-4000-8000-000000000002',
   'c1000000-0000-4000-8000-000000000003',
   'c1000000-0000-4000-8000-000000000004'
 );

delete from public.planner_tasks where id in (
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000002',
  'b1000000-0000-4000-8000-000000000003',
  'b1000000-0000-4000-8000-000000000004',
  'b1000000-0000-4000-8000-000000000005',
  'b1000000-0000-4000-8000-000000000006',
  'b1000000-0000-4000-8000-000000000007',
  'b1000000-0000-4000-8000-000000000008'
);

delete from public.planner_contacts where id in (
  'c1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000004'
);

delete from public.planner_meetings where id in (
  'e1000000-0000-4000-8000-000000000001',
  'e1000000-0000-4000-8000-000000000002',
  'e1000000-0000-4000-8000-000000000003'
);

delete from public.planner_posts where id in (
  'f1000000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000003',
  'f1000000-0000-4000-8000-000000000004',
  'f1000000-0000-4000-8000-000000000005'
);

delete from public.planner_notes where id in (
  '91000000-0000-4000-8000-000000000001',
  '91000000-0000-4000-8000-000000000002',
  '91000000-0000-4000-8000-000000000003',
  '91000000-0000-4000-8000-000000000004',
  '91000000-0000-4000-8000-000000000005'
);

-- Tasks -------------------------------------------------------------------
insert into public.planner_tasks (
  id, title, notes, deadline, status, created_by, assignee_id, sort_order, created_at
) values
  (
    'b1000000-0000-4000-8000-000000000001',
    'Cut the YAILIANS teaser to 30 seconds',
    'Open on the corridor shot. End on the title card. Send a link before Thursday.',
    current_date + 3,
    'doing',
    'a2222222-2222-4222-8222-222222222222',
    'a2222222-2222-4222-8222-222222222222',
    80,
    now() - interval '2 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'Confirm the Friday shoot crew',
    'Need camera, art, and a runner. Location is still the studio floor.',
    current_date + 1,
    'open',
    'a1111111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    70,
    now() - interval '1 day'
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'Send the Northwind pitch deck',
    'Leela has the story. Noah has the frames. Do not send until both are in.',
    current_date + 2,
    'blocked',
    'a3333333-3333-4333-8333-333333333333',
    'a3333333-3333-4333-8333-333333333333',
    60,
    now() - interval '6 hours'
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'Title cards for the vault rail',
    'Three films. Short titles. White type on the still.',
    current_date - 1,
    'done',
    'a4444444-4444-4444-8444-444444444444',
    'a4444444-4444-4444-8444-444444444444',
    50,
    now() - interval '4 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000005',
    'Write the Monday call notes',
    'What they asked, what we promised, and the next call time.',
    current_date + 1,
    'doing',
    'a3333333-3333-4333-8333-333333333333',
    'a1111111-1111-4111-8111-111111111111',
    40,
    now() - interval '5 hours'
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    'Pack the product film kit',
    'Lens set, bounce, and the extra battery case.',
    current_date + 4,
    'open',
    'a1111111-1111-4111-8111-111111111111',
    'a4444444-4444-4444-8444-444444444444',
    30,
    now() - interval '3 hours'
  );

-- Also put two tasks on the existing CEO, so the home plate is not empty.
insert into public.planner_tasks (
  id, title, notes, deadline, status, created_by, assignee_id, sort_order, created_at
)
select
  'b1000000-0000-4000-8000-000000000007',
  'Review the sample deck',
  'Look at Northwind and say if the pitch is ready to send.',
  current_date + 2,
  'open',
  ceo.id,
  ceo.id,
  90,
  now() - interval '30 minutes'
from public.planner_members ceo
where ceo.is_ceo = true
  and ceo.email not like '%.sample@yourailens.studio'
order by ceo.created_at
limit 1;

insert into public.planner_tasks (
  id, title, notes, deadline, status, created_by, assignee_id, sort_order, created_at
)
select
  'b1000000-0000-4000-8000-000000000008',
  'Call Northwind about the cut',
  'They want a shorter open. Mira has the time.',
  current_date + 1,
  'doing',
  ceo.id,
  ceo.id,
  85,
  now() - interval '20 minutes'
from public.planner_members ceo
where ceo.is_ceo = true
  and ceo.email not like '%.sample@yourailens.studio'
order by ceo.created_at
limit 1;

-- Follow ups --------------------------------------------------------------
insert into public.planner_contacts (
  id, name, company, role_title, phone, email, website, notes,
  contacted, status, next_follow_up_at, requirement, pitch, owner_id, created_by, created_at
) values
  (
    'c1000000-0000-4000-8000-000000000001',
    'Aisha Rahman',
    'Northwind Beauty',
    'Brand lead',
    '+91 98450 11021',
    'aisha@northwind.example',
    'https://northwind.example',
    'Warm lead. Likes short films more than static posts.',
    true,
    'active',
    now() + interval '1 day',
    'A 30 second film and three cutdowns for their launch week.',
    'Studio made film, not an ad that looks like an ad. YAILIANS tone, quieter grade.',
    'a3333333-3333-4333-8333-333333333333',
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '5 days'
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'Rohan Desai',
    'Lumen Foods',
    'Marketing head',
    '+91 98200 44118',
    'rohan@lumen.example',
    'https://lumen.example',
    'Inbound from the site. Has not been called yet.',
    false,
    'new',
    now() + interval '3 days',
    'A product film for a new snack line, plus stills.',
    'One day shoot, tabletop, and a founder line at the end.',
    'a1111111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    now() - interval '1 day'
  ),
  (
    'c1000000-0000-4000-8000-000000000003',
    'Priya Nair',
    'Halcyon Hotels',
    'Creative director',
    '+91 99000 22841',
    'priya@halcyon.example',
    'https://halcyon.example',
    'Signed. First film is the lobby at dusk.',
    true,
    'won',
    now() + interval '10 days',
    'A brand film and a set of room films for the site.',
    'Quiet camera, real guests, no stock music.',
    'a1111111-1111-4111-8111-111111111111',
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '12 days'
  ),
  (
    'c1000000-0000-4000-8000-000000000004',
    'Dev Kapoor',
    'Orbit Mobility',
    'Founder',
    '+91 98111 90332',
    'dev@orbit.example',
    'https://orbit.example',
    'Paused until their funding round closes.',
    true,
    'paused',
    now() + interval '21 days',
    'A launch film for an electric scooter.',
    'Night city, one rider, product only in the last shot.',
    'a3333333-3333-4333-8333-333333333333',
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '20 days'
  );

insert into public.planner_contact_entries (
  id, contact_id, kind, body, scheduled_at, created_by, created_at
) values
  (
    'd1000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'contacted',
    'Called Aisha. She watched the vault reel and asked for something in that tone.',
    null,
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '4 days'
  ),
  (
    'd1000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000001',
    'ask',
    'They asked if we can deliver a 15 second cut and a 6 second cut with the same grade.',
    null,
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '4 days' + interval '10 minutes'
  ),
  (
    'd1000000-0000-4000-8000-000000000003',
    'c1000000-0000-4000-8000-000000000001',
    'requirement',
    'Launch week is the first week of next month. Hero film plus three cutdowns.',
    null,
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '3 days'
  ),
  (
    'd1000000-0000-4000-8000-000000000004',
    'c1000000-0000-4000-8000-000000000001',
    'pitch',
    'Pitched a one day studio shoot and a corridor scene, no voiceover.',
    null,
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '3 days' + interval '20 minutes'
  ),
  (
    'd1000000-0000-4000-8000-000000000005',
    'c1000000-0000-4000-8000-000000000001',
    'scheduled',
    'Next call to walk the deck and lock the shoot date.',
    now() + interval '1 day',
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '2 days'
  ),
  (
    'd1000000-0000-4000-8000-000000000006',
    'c1000000-0000-4000-8000-000000000003',
    'outcome',
    'Priya approved the treatment. Contract is with their finance team.',
    null,
    'a1111111-1111-4111-8111-111111111111',
    now() - interval '8 days'
  ),
  (
    'd1000000-0000-4000-8000-000000000007',
    'c1000000-0000-4000-8000-000000000002',
    'next',
    'First call. Ask about the snack line, the talent, and whether they have a kitchen we can use.',
    null,
    'a1111111-1111-4111-8111-111111111111',
    now() - interval '1 day'
  );

-- Meetings ----------------------------------------------------------------
insert into public.planner_meetings (
  id, title, notes, starts_at, ends_at, created_by, created_at
) values
  (
    'e1000000-0000-4000-8000-000000000001',
    'Monday studio standup',
    'Teaser is in picture lock. Northwind deck is the blocker. Noah sends frames tonight.',
    now() - interval '2 days',
    now() - interval '2 days' + interval '40 minutes',
    'a1111111-1111-4111-8111-111111111111',
    now() - interval '2 days'
  ),
  (
    'e1000000-0000-4000-8000-000000000002',
    'Northwind brand call',
    'Walk the deck. Confirm the 30 second length. Ask who approves the grade.',
    now() + interval '1 day',
    now() + interval '1 day' + interval '45 minutes',
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '1 day'
  ),
  (
    'e1000000-0000-4000-8000-000000000003',
    'Edit review',
    'Watch the teaser together. Note the two shots Arjun still wants to swap.',
    now() + interval '4 hours',
    now() + interval '5 hours',
    'a2222222-2222-4222-8222-222222222222',
    now() - interval '3 hours'
  );

insert into public.planner_meeting_attendees (meeting_id, member_id) values
  ('e1000000-0000-4000-8000-000000000001', 'a1111111-1111-4111-8111-111111111111'),
  ('e1000000-0000-4000-8000-000000000001', 'a2222222-2222-4222-8222-222222222222'),
  ('e1000000-0000-4000-8000-000000000001', 'a3333333-3333-4333-8333-333333333333'),
  ('e1000000-0000-4000-8000-000000000001', 'a4444444-4444-4444-8444-444444444444'),
  ('e1000000-0000-4000-8000-000000000002', 'a3333333-3333-4333-8333-333333333333'),
  ('e1000000-0000-4000-8000-000000000002', 'a1111111-1111-4111-8111-111111111111'),
  ('e1000000-0000-4000-8000-000000000003', 'a2222222-2222-4222-8222-222222222222'),
  ('e1000000-0000-4000-8000-000000000003', 'a4444444-4444-4444-8444-444444444444');

insert into public.planner_meeting_attendees (meeting_id, member_id)
select 'e1000000-0000-4000-8000-000000000001', ceo.id
from public.planner_members ceo
where ceo.is_ceo = true
  and ceo.email not like '%.sample@yourailens.studio'
order by ceo.created_at
limit 1
on conflict do nothing;

insert into public.planner_meeting_attendees (meeting_id, member_id)
select 'e1000000-0000-4000-8000-000000000002', ceo.id
from public.planner_members ceo
where ceo.is_ceo = true
  and ceo.email not like '%.sample@yourailens.studio'
order by ceo.created_at
limit 1
on conflict do nothing;

-- Feed --------------------------------------------------------------------
insert into public.planner_posts (id, author_id, body, created_at) values
  (
    'f1000000-0000-4000-8000-000000000001',
    'a1111111-1111-4111-8111-111111111111',
    'Friday shoot is on the studio floor. Crew list is almost locked. If you are in, tell me today.',
    now() - interval '5 hours'
  ),
  (
    'f1000000-0000-4000-8000-000000000002',
    'a2222222-2222-4222-8222-222222222222',
    'Teaser picture lock is close. The corridor shot stays. I am still swapping the last two cuts.',
    now() - interval '3 hours'
  ),
  (
    'f1000000-0000-4000-8000-000000000003',
    'a3333333-3333-4333-8333-333333333333',
    'Northwind wants the deck before the call tomorrow. Pitch is the quiet film, not a loud ad.',
    now() - interval '2 hours'
  ),
  (
    'f1000000-0000-4000-8000-000000000004',
    'a4444444-4444-4444-8444-444444444444',
    'Vault rail titles are in. White type, short names, no extra lines.',
    now() - interval '1 hour'
  );

insert into public.planner_posts (id, author_id, body, created_at)
select
  'f1000000-0000-4000-8000-000000000005',
  ceo.id,
  'Sample week is in the planner. Look through tasks, follow ups, and each person page before we add real work.',
  now() - interval '15 minutes'
from public.planner_members ceo
where ceo.is_ceo = true
  and ceo.email not like '%.sample@yourailens.studio'
order by ceo.created_at
limit 1;

-- Notes on each person page -----------------------------------------------
insert into public.planner_notes (id, member_id, author_id, title, body, created_at, updated_at) values
  (
    '91000000-0000-4000-8000-000000000001',
    'a1111111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'Shoot day running notes',
    E'Call time is 8. Floor is studio B.\nArt arrives with the product table.\nClient is not on set. Send stills at lunch.',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    '91000000-0000-4000-8000-000000000002',
    'a2222222-2222-4222-8222-222222222222',
    'a2222222-2222-4222-8222-222222222222',
    'Teaser cut notes',
    E'Open: corridor, 4 seconds.\nMiddle: hands, then the turn.\nEnd: title, hold, no music sting.\nStill need a cleaner room tone.',
    now() - interval '6 hours',
    now() - interval '6 hours'
  ),
  (
    '91000000-0000-4000-8000-000000000003',
    'a3333333-3333-4333-8333-333333333333',
    'a3333333-3333-4333-8333-333333333333',
    'Northwind requirements',
    E'They asked for 30, 15, and 6 seconds.\nNo voiceover.\nGrade should feel like the vault films.\nApproval sits with Aisha, then their founder.',
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    '91000000-0000-4000-8000-000000000004',
    'a4444444-4444-4444-8444-444444444444',
    'a4444444-4444-4444-8444-444444444444',
    'Deck frames',
    E'Three stills only.\nTitle in Comfortaa, white, left aligned.\nDo not add a logo lockup on the film frames.',
    now() - interval '8 hours',
    now() - interval '8 hours'
  );

insert into public.planner_notes (id, member_id, author_id, title, body, created_at, updated_at)
select
  '91000000-0000-4000-8000-000000000005',
  ceo.id,
  ceo.id,
  'This week',
  E'Review the Northwind deck.\nSit in the edit review.\nPeople pages are under People in the sidebar.',
  now() - interval '10 minutes',
  now() - interval '10 minutes'
from public.planner_members ceo
where ceo.is_ceo = true
  and ceo.email not like '%.sample@yourailens.studio'
order by ceo.created_at
limit 1;
