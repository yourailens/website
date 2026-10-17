-- ============================================================
-- 092 · Sample contact cards
-- Run in the Supabase SQL editor after 090_planner_bios.sql.
-- Safe to run again. It only refreshes these sample cards.
-- Asha Verma and anything you typed yourself stay as they are.
-- ============================================================

alter table public.planner_bios
  add column if not exists category text;

alter table public.planner_bios
  add column if not exists label text;

update public.planner_bios
set category = 'lead',
    label = 'Client'
where category is null
  and lower(coalesce(relationship, '')) = 'client';

update public.planner_bios
set category = 'misc'
where category is null;

alter table public.planner_bios
  alter column category set default 'misc';

alter table public.planner_bios
  alter column category set not null;

alter table public.planner_bios
  drop constraint if exists planner_bios_category_check;

alter table public.planner_bios
  add constraint planner_bios_category_check
  check (category in ('lead', 'sponsor', 'misc'));

insert into public.planner_bios (
  id, slug, full_name, preferred_name, pronouns, company, role_title, department,
  email, phone, whatsapp, website, linkedin, instagram, city, country, industry,
  languages, category, label, relationship, source, introduced_by, birthday, bio, notes,
  owner_id, created_by
)
select
  v.id::uuid,
  v.slug,
  v.full_name,
  v.preferred_name,
  v.pronouns,
  v.company,
  v.role_title,
  v.department,
  v.email,
  v.phone,
  v.whatsapp,
  v.website,
  v.linkedin,
  v.instagram,
  v.city,
  v.country,
  v.industry,
  v.languages,
  v.category,
  v.label,
  v.relationship,
  v.source,
  v.introduced_by,
  v.birthday::date,
  v.bio,
  v.notes,
  owner.id,
  creator.id
from (
  values
    (
      'b1000000-0000-4000-8000-000000000001',
      'rhea-menon', 'Rhea Menon', 'Rhea', 'She',
      'Halcyon Hotels', 'Producer', 'Marketing',
      'rhea.menon@halcyon.example', '+91 98400 11021', '+91 98400 11021',
      'halcyon.example', 'linkedin.com/in/rheamenon', '@rheamenon',
      'Hyderabad', 'India', 'Hospitality', 'English, Hindi, Telugu',
      'lead', 'Warm', 'Client', 'Referral', 'Mira Kapoor', '1992-04-16',
      'Looks after hotel films for Halcyon. Likes a short call before a deck.',
      'Ask about the monsoon campaign before sending a budget.',
      'mira.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000002',
      'kabir-seth', 'Kabir Seth', 'Kabir', 'He',
      'Northwind', 'Head of marketing', 'Brand',
      'kabir.seth@northwind.example', '+91 98200 44110', '+91 98200 44110',
      'northwind.example', 'linkedin.com/in/kabirseth', '@kabirseth',
      'Mumbai', 'India', 'Film', 'English, Hindi',
      'lead', 'Hot', 'Client', 'Event', 'Leela Shah', '1988-11-02',
      'Wants a 30 second cut and a longer film for the site. Moves fast once he likes the open.',
      'Send the shorter open before Thursday. He reads email at night.',
      'leela.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000003',
      'anika-rao', 'Anika Rao', 'Anika', 'She',
      'Frame Journal', 'Writer', 'Culture',
      'anika@framejournal.example', '+91 98111 22009', null,
      'framejournal.example', null, '@anikarao',
      'Delhi', 'India', 'Press', 'English, Hindi',
      'lead', 'Cold', 'Press', 'Email', 'Noah Iyer', '1995-07-21',
      'Writes about sets and small studios. Replied once, then went quiet.',
      'Do not pitch. Wait until she asks about the vault.',
      'noah.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000004',
      'farhan-qureshi', 'Farhan Qureshi', 'Farhan', 'He',
      'Orbit Studios', 'Creative director', 'Production',
      'farhan@orbitstudios.example', '+91 99000 77881', '+91 99000 77881',
      'orbitstudios.example', 'linkedin.com/in/farhanqureshi', '@orbitstudios',
      'Bengaluru', 'India', 'Film', 'English, Hindi, Kannada',
      'lead', 'Client', 'Client', 'Referral', 'Sushmith Thuluva', '1986-01-09',
      'Already a client. Comes back for title sequences and the odd product film.',
      'He likes the work shown as stills first, then the cut.',
      'sushmith.thuluva@gmail.com'
    ),
    (
      'b1000000-0000-4000-8000-000000000005',
      'meera-lal', 'Meera Lal', 'Meera', 'She',
      'Aster Group', 'Brand director', 'Partnerships',
      'meera.lal@aster.example', '+91 97654 33012', '+91 97654 33012',
      'aster.example', 'linkedin.com/in/meeralal', '@astergroup',
      'Mumbai', 'India', 'Hospitality', 'English, Hindi, Marathi',
      'sponsor', 'Big', 'Partner', 'Event', 'Mira Kapoor', '1984-09-30',
      'Runs brand money for a hotel group. A film with them would be a season, not a one off.',
      'Big sponsor. Talk scope before price.',
      'mira.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000006',
      'vikram-das', 'Vikram Das', 'Vikram', 'He',
      'Paperkite', 'Founder', null,
      'vikram@paperkite.example', '+91 98860 14567', '+91 98860 14567',
      'paperkite.example', 'linkedin.com/in/vikramdas', '@paperkite',
      'Pune', 'India', 'Design', 'English, Hindi, Marathi',
      'sponsor', 'Medium', 'Partner', 'On set', 'Arjun Mehta', '1990-03-12',
      'Makes objects and wants a short film for a launch. Budget is real, not huge.',
      'Medium sponsor. He can wait two weeks.',
      'arjun.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000007',
      'tara-bose', 'Tara Bose', 'Tara', 'She',
      'Little Loom', 'Owner', null,
      'tara@littleloom.example', '+91 97400 55210', '+91 97400 55210',
      'littleloom.example', null, '@littleloom',
      'Kochi', 'India', 'Retail', 'English, Malayalam',
      'sponsor', 'Small', 'Friend', 'Instagram', 'Leela Shah', '1996-12-05',
      'A small cloth shop that wants one film for Instagram. Sweet, small budget.',
      'Small sponsor. Keep the ask to one day of shoot.',
      'leela.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000008',
      'ishaan-kapur', 'Ishaan Kapur', 'Ishaan', 'He',
      'City Desk', 'Editor', 'Culture',
      'ishaan@citydesk.example', '+91 98100 90909', null,
      'citydesk.example', null, '@ishaankapur',
      'Delhi', 'India', 'Press', 'English, Hindi',
      'misc', 'Press', 'Press', 'Email', 'Anika Rao', '1991-06-18',
      'Edits a weekend culture page. Useful when a film is ready to be seen.',
      'Send stills, not a deck.',
      'noah.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000009',
      'priya-nair', 'Priya Nair', 'Priya', 'She',
      'Lenscart Rentals', 'Rentals lead', 'Kit',
      'priya@lenscart.example', '+91 98450 22119', '+91 98450 22119',
      'lenscart.example', null, '@lenscartrentals',
      'Hyderabad', 'India', 'Film', 'English, Telugu, Hindi',
      'misc', 'Vendor', 'Vendor', 'On set', 'Noah Iyer', '1993-08-27',
      'Holds the extra bodies and the lights we borrow. Answers WhatsApp faster than email.',
      'Book her two days before a shoot.',
      'arjun.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000010',
      'zoya-khan', 'Zoya Khan', 'Zoya', 'She',
      null, 'Actor', null,
      'zoya.khan@example.com', '+91 98920 61616', '+91 98920 61616',
      null, null, '@zoyakhan',
      'Mumbai', 'India', 'Film', 'English, Hindi, Urdu',
      'misc', 'Talent', 'Talent', 'Referral', 'Farhan Qureshi', '1997-02-14',
      'Actor we have used for a product film. Calm on set, good with stills.',
      'Check dates before promising her to a client.',
      'leela.sample@yourailens.studio'
    ),
    (
      'b1000000-0000-4000-8000-000000000011',
      'rohan-gill', 'Rohan Gill', 'Rohan', 'He',
      null, 'Director', null,
      'rohan.gill@example.com', '+91 98765 43210', '+91 98765 43210',
      null, null, '@rohangill',
      'Bengaluru', 'India', 'Film', 'English, Hindi, Punjabi',
      'misc', 'Friend', 'Friend', 'On set', 'Sushmith Thuluva', '1989-05-03',
      'A director friend. Not a client. Good for a second pair of eyes on a cut.',
      'Call him, do not email a deck.',
      'sushmith.thuluva@gmail.com'
    )
) as v (
  id, slug, full_name, preferred_name, pronouns, company, role_title, department,
  email, phone, whatsapp, website, linkedin, instagram, city, country, industry,
  languages, category, label, relationship, source, introduced_by, birthday, bio, notes,
  owner_email
)
join public.planner_members owner on owner.email = v.owner_email
cross join lateral (
  select id
  from public.planner_members
  where is_ceo = true
  order by created_at
  limit 1
) creator
on conflict (slug) do update set
  full_name = excluded.full_name,
  preferred_name = excluded.preferred_name,
  pronouns = excluded.pronouns,
  company = excluded.company,
  role_title = excluded.role_title,
  department = excluded.department,
  email = excluded.email,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  website = excluded.website,
  linkedin = excluded.linkedin,
  instagram = excluded.instagram,
  city = excluded.city,
  country = excluded.country,
  industry = excluded.industry,
  languages = excluded.languages,
  category = excluded.category,
  label = excluded.label,
  relationship = excluded.relationship,
  source = excluded.source,
  introduced_by = excluded.introduced_by,
  birthday = excluded.birthday,
  bio = excluded.bio,
  notes = excluded.notes,
  owner_id = excluded.owner_id;
