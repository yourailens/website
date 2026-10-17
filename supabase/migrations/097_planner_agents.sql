-- ============================================================
-- 097 · Planner agents (spy login roster + core flag)
-- No public signup. Agents are seeded here. Login is:
--   pick your name → enter your secret clearance code
-- Run in the Supabase SQL editor after 088_planner.sql.
-- Safe to re-run. Updates codes / core flags for these emails.
--
-- CLEARANCE CODES: see 098_planner_agent_codes.sql (3-digit).
-- ============================================================

alter table public.planner_members
  add column if not exists is_core boolean not null default false;

comment on column public.planner_members.is_core is
  'Core agents see gated planner ops (finances, etc.).';

-- Retire old sample logins so they never appear in the agent picker
update public.planner_members
   set active = false
 where email in (
   'mira.sample@yourailens.studio',
   'arjun.sample@yourailens.studio',
   'leela.sample@yourailens.studio',
   'noah.sample@yourailens.studio'
 );

insert into public.planner_members (
  id, email, password_hash, display_name, slug, role_title, is_ceo, is_core, active, bio
) values
  (
    'b1000001-0001-4001-8001-000000000001',
    'sushmith.thuluva@gmail.com',
    'scrypt:29c222d017d0b23810e5ed3c8c857126:1d4207e2898c882e3b9819a7ecabc87460ae91b41c24acc46bb00133ce946327f9ea95f777b33e195918cf79372db0b7864d3ec9c0a2fa0c3274a50b3f210d2c',
    'Sushmith',
    'sushmith',
    'Director',
    true,
    true,
    true,
    'Studio lead. Full clearance.'
  ),
  (
    'b1000001-0001-4001-8001-000000000002',
    'sandy@planner.yourailens.studio',
    'scrypt:0d206dfe059113cc3568ae591f7a0fc9:23b95db14a27aa8e97215264278e8d25efaa1ee1cc87970da83130e510e604dc2459c5a8029834658bda9f7ec271f8e81aed6cf80de560a1a6c7e5b48f3e3077',
    'Sandy',
    'sandy',
    'Core',
    false,
    true,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-000000000003',
    'anusri@planner.yourailens.studio',
    'scrypt:5f00dfa82d0cbad34945d4751766b304:cce556751ca630853c9ea4878f970118ed554ff5c47c3bfed47f10fe4eec97f8500a29924b47b78c1eba6e25d9709e285ce41f84afb2a307f5099d49ab30e2ad',
    'Anusri',
    'anusri',
    'Core',
    false,
    true,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-000000000004',
    'navya@planner.yourailens.studio',
    'scrypt:c4fc975d01b371934e82b50549109a70:b687698f0fcd8f94c1a08699ed89a71ae40909ca7faf94530b49542402a7e4bc00e3c8f1bf91c551bac834e12629568b0286b4738d7619c10e0679564cc7f7ab',
    'Navya',
    'navya',
    'Core',
    false,
    true,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-000000000005',
    'aakash@planner.yourailens.studio',
    'scrypt:37de73793153095f07a7951201ea4019:41d329d120cc9c758aaad5a80f276b35f9cfb26b9c855c743ca48c136956cd98f3f00f9eace3a39804980878b69c1b33389ea0baaf7a4f8fbf634d575d441afb',
    'Aakash',
    'aakash',
    'Core',
    false,
    true,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-000000000006',
    'chakrika@planner.yourailens.studio',
    'scrypt:3582f3afb897962ebb2fc7200e6ae67e:1bd376ac47a1daa777762ac4313c2038558ea1b2f29925e1d4a95bf3ca07dfce8c71e0373282517c1fffe3e7bcb92dcbcef3af8631cc3700945b2e41f469f96a',
    'Chakrika',
    'chakrika',
    'Agent',
    false,
    false,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-000000000007',
    'gauri@planner.yourailens.studio',
    'scrypt:6c25ea22b23e58c5155738b7298d7056:a2bbd8338f21df8fee60f9aa2c90c5d4decfdd499e2a8f8427cad53f3c12f400135d3bb5a6f44ca209e38384514d9edad8ffbc837029b61679c35bd73a3838e9',
    'Gauri',
    'gauri',
    'Agent',
    false,
    false,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-000000000008',
    'rutuja@planner.yourailens.studio',
    'scrypt:d1f005129fbf60a2a61050e532d0b1f1:0411fb09d49f30bdb51f8a9ef48917c5a3bcb598124ce34030d85b2b9c110dcdf17e8b2b5f06def23b1687186a1698bbee99076a002591795be8e006b4d12ae1',
    'Rutuja',
    'rutuja',
    'Agent',
    false,
    false,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-000000000009',
    'snigdha@planner.yourailens.studio',
    'scrypt:d398f2b181755d870ece1b2d85cac5bb:a305af93ad73ef076e2974f12b8102b790c58b73a6e861e7530ae4b814c1de03b54a305bb908202faf177dc7ad0381fb764e3edf0d2c27738a8e700a7b1e17f9',
    'Snigdha',
    'snigdha',
    'Agent',
    false,
    false,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-00000000000a',
    'ullas@planner.yourailens.studio',
    'scrypt:110c21951518a76cb248620a14249a1b:46f19cd178160dbc15aa4128d63922a09321677d239ba387960bb8b4189c6a7f5087ec638d343896d160901f378a6b06e8211fffdc3bb982c4aa955a564e7a96',
    'Ullas',
    'ullas',
    'Agent',
    false,
    false,
    true,
    null
  ),
  (
    'b1000001-0001-4001-8001-00000000000b',
    'aaryan@planner.yourailens.studio',
    'scrypt:1da50fd82bf6ed3fa3eb50919a3769c6:0cde2da5b13c8fb33c55ac5e0d57bc7022fb43cc2b7239bff4101cb56571b31ac6bb191863e282d08339a564b68306915b6d3c167346251b8c61d74b69b49e88',
    'Aaryan',
    'aaryan',
    'Agent',
    false,
    false,
    true,
    null
  )
on conflict (email) do update set
  display_name  = excluded.display_name,
  slug          = excluded.slug,
  role_title    = excluded.role_title,
  is_ceo        = excluded.is_ceo,
  is_core       = excluded.is_core,
  active        = true,
  bio           = coalesce(excluded.bio, public.planner_members.bio),
  password_hash = excluded.password_hash,
  updated_at    = now();
