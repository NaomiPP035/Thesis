-- Between Surfaces: private records, scoped to the signed-in user.
-- Run once in your Supabase project's SQL Editor. Safe to run again.
begin;
create table if not exists public.atlas_moments (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint atlas_moments_title_valid check (
    jsonb_typeof(payload->'title') = 'string'
    and length(payload->>'title') between 1 and 160
  ),
  constraint atlas_moments_text_valid check (
    jsonb_typeof(payload->'text') = 'string'
    and length(payload->>'text') between 1 and 10000
  ),
  constraint atlas_moments_payload_size check (octet_length(payload::text) < 40000)
);
create index if not exists atlas_moments_user_created_idx
  on public.atlas_moments (user_id, created_at);
alter table public.atlas_moments enable row level security;
revoke all on public.atlas_moments from anon;
grant select, insert, update, delete on public.atlas_moments to authenticated;
drop policy if exists "atlas_select_own" on public.atlas_moments;
create policy "atlas_select_own" on public.atlas_moments
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "atlas_insert_own" on public.atlas_moments;
create policy "atlas_insert_own" on public.atlas_moments
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "atlas_update_own" on public.atlas_moments;
create policy "atlas_update_own" on public.atlas_moments
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "atlas_delete_own" on public.atlas_moments;
create policy "atlas_delete_own" on public.atlas_moments
  for delete to authenticated using ((select auth.uid()) = user_id);
commit;
