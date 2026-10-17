-- ============================================================
-- 098 · Planner agent clearance codes → 3-digit
-- Run in the Supabase SQL editor after 097_planner_agents.sql.
-- Safe to re-run. Updates password hashes for these emails only.
--
-- CLEARANCE CODES (3 digits — share privately)
--   Sushmith  · 580
--   Sandy     · 830
--   Anusri    · 267
--   Navya     · 756
--   Aakash    · 505
--   Chakrika  · 558
--   Gauri     · 614
--   Rutuja    · 883
--   Snigdha   · 353
--   Ullas     · 664
--   Aaryan    · 467
-- ============================================================

update public.planner_members
   set password_hash = v.hash,
       updated_at = now()
  from (values
    (
      'sushmith.thuluva@gmail.com',
      'scrypt:55ffbb63fe42708655cabde7eec740c0:944242918531317ba9ae54dbe08eefbddca4647bf91d0aeca976a9447db277977b31494d0bbe0ec565bbce47402bdce2a3b9b81d43f20d27a5c979212babcdc4'
    ),
    (
      'sandy@planner.yourailens.studio',
      'scrypt:6b9868f329606ab5ff2a605f3e043d04:f2d1a3f8da5a89a4ff527aa35180e6aec5ff907de94c5b4ddad95ba19112a6a9d952a64667d2efdd828377333c1d4da02632ccb3c950c38a59215534374a90d5'
    ),
    (
      'anusri@planner.yourailens.studio',
      'scrypt:551ab87ea340712dfe9455469c11f3a0:50fd9f41f306c67924766578edc425eb7d0bc05d9bdd179d80107dbd94d2b41a74a6b670aa7be4ee2bf9f05eccb898d4ebb4d57fd368272a5d8c3241270dd984'
    ),
    (
      'navya@planner.yourailens.studio',
      'scrypt:7e373e443acea21d4aca425db60536a3:c5765db31da74e2cd56d43100c70a21387d643ee77c374521955915a0e37fe6a2e14f3ae1e376c3e6bb6977c0dead28bec8007a6d1253c1589dd8f5f5c8c62e5'
    ),
    (
      'aakash@planner.yourailens.studio',
      'scrypt:e9e1dbb0e3b2f8964aa6cfbbb048d2c6:eae9efc79ed7206cf56eb95315c80b31239453153482c862744a6d47e01a90193e74f5b78e0c4eadb803898a17d9d539c5a33d6bf04a1a6f53c01b0138bb878e'
    ),
    (
      'chakrika@planner.yourailens.studio',
      'scrypt:cd679fba5170ec337e9d03097cb485f5:57d53ee26ed62ad2964cc1681b89674534d2a3881a8afbfb3a56749ee2b09abbb8d21f600b766baa4f241ea0a14c50f31ccfa48ba6835ed0c2ca03368266ecad'
    ),
    (
      'gauri@planner.yourailens.studio',
      'scrypt:cee101f7b58de8ed9c0e2a5f40ac4569:dedce872578640a25bcdd0ac8b13332ff90bffe940a1e9cf083f96e8f2b4f509b3828bd6ca12c6079157439d61631adb78e7513b1586e9a4c8c682236baa4d6b'
    ),
    (
      'rutuja@planner.yourailens.studio',
      'scrypt:b880553ff96fb5adf7d6b2f019b80f54:4ff0292c754d1f7b5da51889f55aced4f924853c8f21a99d05f0046c710d873575648d278c2029d63f9a06ffde8c54b8bfba58f808619248e0c4d6c131f7157b'
    ),
    (
      'snigdha@planner.yourailens.studio',
      'scrypt:ce396c109be106dfa3e890062cc9e115:66c03c6191b789464e6e4fbfada3a840d8dcda2e10ba280ade942302b73c353f781c657bd7811afb664e10372c6d9c2d6301d52839dea9308878010a35e2390e'
    ),
    (
      'ullas@planner.yourailens.studio',
      'scrypt:d4eea9278be95ea4f61a727c582e0d07:f927b743fe7829f9c7c7d51a18e42c950d04c5a09c0786a066adb67253110bfcbb82c0595a893c2324b6041debd3b341a687ec68403cd99db5231225ab0ee537'
    ),
    (
      'aaryan@planner.yourailens.studio',
      'scrypt:cc14849ae702d49bd57a21c01428cb46:1a713ee2b4f37fb8a20e2510b05b0f5185cce3cd6c94151cd4468dd385bfa036983c4a17f3204fe2ce2e41c65855a09088d865576d48beaff6d4d577c75bf891'
    )
  ) as v(email, hash)
 where public.planner_members.email = v.email;
