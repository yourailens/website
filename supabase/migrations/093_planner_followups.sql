-- Follow ups: what they need right now, whether the next meet is booked,
-- and a "meet" kind so the timeline can log an actual meetup.
-- Safe to run more than once.

alter table public.planner_contacts
  add column if not exists follow_up_booked boolean not null default false;

alter table public.planner_contacts
  add column if not exists immediate_need text;

update public.planner_contacts
set follow_up_booked = true
where next_follow_up_at is not null
  and follow_up_booked = false;

update public.planner_contacts
set immediate_need = 'Hero film and three cutdowns before launch week.'
where id = 'c1000000-0000-4000-8000-000000000001'
  and coalesce(immediate_need, '') = '';

update public.planner_contacts
set immediate_need = 'First call about the snack film and whether they have a kitchen.'
where id = 'c1000000-0000-4000-8000-000000000002'
  and coalesce(immediate_need, '') = '';

update public.planner_contacts
set immediate_need = 'Lobby film at dusk, then the room films for the site.'
where id = 'c1000000-0000-4000-8000-000000000003'
  and coalesce(immediate_need, '') = '';

update public.planner_contacts
set immediate_need = 'On hold until their funding round closes.'
where id = 'c1000000-0000-4000-8000-000000000004'
  and coalesce(immediate_need, '') = '';

do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'planner_contact_entries'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%kind%'
  loop
    execute format('alter table public.planner_contact_entries drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.planner_contact_entries
  add constraint planner_contact_entries_kind_check
  check (kind in (
    'meet', 'contacted', 'outcome', 'next', 'requirement',
    'pitch', 'note', 'scheduled', 'ask'
  ));

insert into public.planner_contact_entries (
  id, contact_id, kind, body, scheduled_at, created_by, created_at
) values
  (
    'd1000000-0000-4000-8000-000000000008',
    'c1000000-0000-4000-8000-000000000001',
    'meet',
    'First coffee. She wanted the film to feel like the vault reel, not a product ad.',
    null,
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '6 days'
  ),
  (
    'd1000000-0000-4000-8000-000000000009',
    'c1000000-0000-4000-8000-000000000003',
    'meet',
    'Walked the lobby at dusk and agreed the first film starts there.',
    null,
    'a1111111-1111-4111-8111-111111111111',
    now() - interval '14 days'
  ),
  (
    'd1000000-0000-4000-8000-000000000010',
    'c1000000-0000-4000-8000-000000000004',
    'meet',
    'Met Dev. The scooter film waits until the round closes.',
    null,
    'a3333333-3333-4333-8333-333333333333',
    now() - interval '18 days'
  )
on conflict (id) do nothing;
