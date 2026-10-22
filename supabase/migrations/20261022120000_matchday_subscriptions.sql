-- Additive subscription storage and database-level protection for unpublished outcomes.
-- Apply after the two existing migrations. Existing predictions are preserved.
begin;
create table if not exists public.profile_subscriptions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null references public.predictor_profiles(id) on delete cascade,
  tx_ref text not null unique,
  amount_etb numeric(12,2) not null check (amount_etb > 0),
  duration_days integer not null check (duration_days between 1 and 366),
  status text not null default 'pending' check (status in ('pending','active','expired')),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  expires_at timestamptz
);
create index if not exists profile_subscriptions_access_idx on public.profile_subscriptions(user_id,profile_id,status,expires_at);
alter table public.profile_subscriptions enable row level security;
drop policy if exists "Subscribers read their own access" on public.profile_subscriptions;
create policy "Subscribers read their own access" on public.profile_subscriptions for select to authenticated using(user_id=(select auth.uid()));
grant select on public.profile_subscriptions to anon,authenticated;
grant all on public.profile_subscriptions to service_role;

-- Called only by the server after it has verified payment reference, amount and currency.
create or replace function public.activate_profile_subscription(p_tx_ref text)
returns public.profile_subscriptions language plpgsql set search_path=public as $$
declare v_sub public.profile_subscriptions;
begin
  select * into v_sub from public.profile_subscriptions where tx_ref=p_tx_ref for update;
  if not found then return null; end if;
  if v_sub.status='pending' then
    update public.profile_subscriptions set status='active',activated_at=now(),
      expires_at=now()+make_interval(days=>duration_days)
      where id=v_sub.id returning * into v_sub;
  end if;
  return v_sub;
end $$;
revoke all on function public.activate_profile_subscription(text) from public,anon,authenticated;
grant execute on function public.activate_profile_subscription(text) to service_role;

-- A hidden card alone does not secure the public Supabase API. Restrict reads here too.
drop policy if exists "Public read predictions for public profiles" on public.predictions;
drop policy if exists "Read settled records or subscribed forecasts" on public.predictions;
create policy "Read settled records or subscribed forecasts" on public.predictions for select to anon,authenticated using (
  exists(select 1 from public.predictor_profiles p where p.id=predictions.profile_id and p.visibility='public')
  and (status in ('settled','void') or exists(
    select 1 from public.profile_subscriptions s where s.profile_id=predictions.profile_id
      and s.user_id=(select auth.uid()) and s.status='active' and s.expires_at>now()
  ))
);
drop policy if exists "Public read betting for public predictions" on public.betting_records;
drop policy if exists "Subscribers read recorded prices" on public.betting_records;
create policy "Subscribers read recorded prices" on public.betting_records for select to authenticated using (
  exists(select 1 from public.predictions p join public.profile_subscriptions s on s.profile_id=p.profile_id
    where p.id=prediction_id and s.user_id=(select auth.uid()) and s.status='active' and s.expires_at>now())
);
commit;
