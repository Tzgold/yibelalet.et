-- Football prediction leaderboard schema
-- Apply via Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.competitions (
  id text primary key,
  name text not null,
  short_name text not null,
  country text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id text primary key,
  name text not null,
  short_name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.predictor_profiles (
  id text primary key,
  slug text not null unique,
  display_name text not null,
  handle text not null unique,
  profile_type text not null check (profile_type in ('human', 'ai')),
  avatar_url text,
  bio text not null default '',
  specialties text[] not null default '{}',
  competition_ids text[] not null default '{}',
  join_date date not null,
  visibility text not null default 'public'
    check (visibility in ('public', 'unlisted', 'private')),
  model_type text,
  model_version text,
  methodology text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists predictor_profiles_slug_idx on public.predictor_profiles (slug);
create index if not exists predictor_profiles_type_idx on public.predictor_profiles (profile_type);
create index if not exists predictor_profiles_visibility_idx on public.predictor_profiles (visibility);

create table if not exists public.football_matches (
  id text primary key,
  provider_match_id text,
  competition_id text not null references public.competitions (id),
  home_team_id text not null references public.teams (id),
  away_team_id text not null references public.teams (id),
  kickoff_at timestamptz not null,
  match_status text not null
    check (match_status in ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
  home_score integer,
  away_score integer,
  data_source text not null default 'manual',
  updated_at timestamptz not null default now(),
  constraint football_matches_provider_unique unique (provider_match_id)
);

create index if not exists football_matches_kickoff_idx on public.football_matches (kickoff_at);
create index if not exists football_matches_competition_idx on public.football_matches (competition_id);

create table if not exists public.predictions (
  id text primary key,
  profile_id text not null references public.predictor_profiles (id) on delete cascade,
  match_id text not null references public.football_matches (id) on delete cascade,
  market_type text not null
    check (market_type in ('match_result', 'over_under_2_5', 'both_teams_to_score', 'double_chance')),
  selection text not null,
  note text,
  probability numeric(5,4) check (probability is null or (probability >= 0 and probability <= 1)),
  published_at timestamptz not null,
  locked_at timestamptz not null,
  model_version text,
  status text not null
    check (status in ('upcoming', 'live', 'pending_settlement', 'settled', 'void', 'postponed')),
  settlement_outcome text
    check (settlement_outcome is null or settlement_outcome in ('win', 'loss', 'void', 'push')),
  settled_at timestamptz,
  source_metadata text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint predictions_unique_profile_match_market unique (profile_id, match_id, market_type)
);

create index if not exists predictions_profile_idx on public.predictions (profile_id);
create index if not exists predictions_match_idx on public.predictions (match_id);
create index if not exists predictions_published_idx on public.predictions (published_at);
create index if not exists predictions_status_idx on public.predictions (status);

create table if not exists public.betting_records (
  id text primary key,
  prediction_id text not null unique references public.predictions (id) on delete cascade,
  odds_at_publication numeric(10,4) not null check (odds_at_publication > 1),
  stake_units numeric(12,4) not null check (stake_units > 0),
  net_return_units numeric(12,4),
  settled_at timestamptz,
  settlement_rule text not null default 'decimal_odds_unit_stake',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists betting_records_settled_idx on public.betting_records (settled_at);

-- Optional follows (ready for auth later)
create table if not exists public.profile_follows (
  follower_user_id uuid not null references auth.users (id) on delete cascade,
  profile_id text not null references public.predictor_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_user_id, profile_id)
);

-- Immutability: block updates to locked/settled prediction core fields
create or replace function public.prevent_locked_prediction_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('settled', 'void') then
    raise exception 'Settled or void predictions cannot be modified';
  end if;
  if now() >= old.locked_at
     and (
       new.selection is distinct from old.selection
       or new.probability is distinct from old.probability
       or new.market_type is distinct from old.market_type
       or new.match_id is distinct from old.match_id
       or new.profile_id is distinct from old.profile_id
     ) then
    raise exception 'Locked predictions cannot change selection or market fields';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_predictions_lock on public.predictions;
create trigger trg_predictions_lock
before update on public.predictions
for each row
execute function public.prevent_locked_prediction_mutation();

-- Idempotent settlement helper
create or replace function public.settle_prediction(
  p_prediction_id text,
  p_outcome text,
  p_settled_at timestamptz default now()
)
returns public.predictions
language plpgsql
as $$
declare
  result public.predictions;
begin
  if p_outcome not in ('win', 'loss', 'void', 'push') then
    raise exception 'Invalid settlement outcome';
  end if;

  update public.predictions
  set
    status = case when p_outcome = 'void' then 'void' else 'settled' end,
    settlement_outcome = p_outcome,
    settled_at = coalesce(settled_at, p_settled_at),
    updated_at = p_settled_at
  where id = p_prediction_id
    and status not in ('settled', 'void')
  returning * into result;

  if result.id is null then
    select * into result from public.predictions where id = p_prediction_id;
  end if;

  return result;
end;
$$;

alter table public.competitions enable row level security;
alter table public.teams enable row level security;
alter table public.predictor_profiles enable row level security;
alter table public.football_matches enable row level security;
alter table public.predictions enable row level security;
alter table public.betting_records enable row level security;
alter table public.profile_follows enable row level security;

-- Public read for catalog data
create policy "Public read competitions"
  on public.competitions for select
  to anon, authenticated
  using (true);

create policy "Public read teams"
  on public.teams for select
  to anon, authenticated
  using (true);

create policy "Public read public profiles"
  on public.predictor_profiles for select
  to anon, authenticated
  using (visibility = 'public');

create policy "Public read matches"
  on public.football_matches for select
  to anon, authenticated
  using (true);

create policy "Public read predictions for public profiles"
  on public.predictions for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.predictor_profiles p
      where p.id = predictions.profile_id and p.visibility = 'public'
    )
  );

create policy "Public read betting for public predictions"
  on public.betting_records for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.predictions pred
      join public.predictor_profiles p on p.id = pred.profile_id
      where pred.id = betting_records.prediction_id and p.visibility = 'public'
    )
  );

create policy "Users manage own follows"
  on public.profile_follows for all
  to authenticated
  using (follower_user_id = auth.uid())
  with check (follower_user_id = auth.uid());
