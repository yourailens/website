-- ============================================================
-- 065 · Drop AI-generated placeholder portraits (keep Chakrika)
-- ============================================================

update public.studio_team_members
set portrait_url = null
where slug in ('lalitha', 'rutuja', 'gauri-shetty', 'chinmay', 'chakrika');
