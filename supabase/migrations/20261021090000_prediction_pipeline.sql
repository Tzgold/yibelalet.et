-- Apply after 20261012170000_football_leaderboard.sql. Pipeline writes use service_role only.
create table public.pipeline_provider_usage (
  provider text not null, period text not null, requests integer not null default 0,
  credits integer not null default 0, last_error text, last_error_at timestamptz,
  primary key (provider, period)
);
create table public.pipeline_analyses (
  id text primary key,
  match_id text not null references public.football_matches(id),
  model_version text not null, payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.pipeline_provider_usage enable row level security;
alter table public.pipeline_analyses enable row level security;

create or replace function public.record_pipeline_usage(p_provider text, p_requests integer, p_credits integer, p_error text default null)
returns void language plpgsql set search_path = public as $$
declare v_period text;
begin
  foreach v_period in array array[to_char(now() at time zone 'UTC', 'YYYY-MM-DD'), to_char(now() at time zone 'UTC', 'YYYY-MM')] loop
    insert into pipeline_provider_usage(provider, period, requests, credits, last_error, last_error_at)
    values (p_provider, v_period, p_requests, p_credits, p_error, case when p_error is not null then now() end)
    on conflict(provider, period) do update set
      requests = pipeline_provider_usage.requests + excluded.requests,
      credits = pipeline_provider_usage.credits + excluded.credits,
      last_error = coalesce(excluded.last_error, pipeline_provider_usage.last_error),
      last_error_at = coalesce(excluded.last_error_at, pipeline_provider_usage.last_error_at);
  end loop;
end $$;

-- Insert the immutable prediction and its publication odds in one transaction.
-- Locking the profile serializes concurrent publishers and enforces the daily cap.
create or replace function public.publish_pipeline_tip(p_tip jsonb, p_daily_cap integer)
returns boolean language plpgsql set search_path = public as $$
declare v_kickoff timestamptz; v_count integer; v_id text; v_status text;
begin
  perform 1 from predictor_profiles where id = p_tip->>'profile_id' for update;
  if not found then raise exception 'Unknown strategy profile'; end if;
  select kickoff_at, match_status into v_kickoff, v_status from football_matches where id = p_tip->>'match_id' for update;
  if v_status is distinct from 'scheduled' or v_kickoff <= now() then return false; end if;
  if (p_tip->>'published_at')::timestamptz > now() or (p_tip->>'published_at')::timestamptz >= v_kickoff then
    raise exception 'Invalid publication time';
  end if;
  select count(*) into v_count from predictions where profile_id = p_tip->>'profile_id'
    and (published_at at time zone 'UTC')::date = (now() at time zone 'UTC')::date;
  if p_daily_cap < 1 or v_count >= p_daily_cap then return false; end if;
  insert into predictions(id, profile_id, match_id, market_type, selection, note, probability,
    published_at, locked_at, model_version, status, source_metadata)
  values(p_tip->>'id', p_tip->>'profile_id', p_tip->>'match_id', p_tip->>'market_type',
    p_tip->>'selection', p_tip->>'note', (p_tip->>'probability')::numeric,
    (p_tip->>'published_at')::timestamptz, (p_tip->>'published_at')::timestamptz,
    p_tip->>'model_version', 'upcoming', p_tip->>'source_metadata')
  on conflict do nothing returning id into v_id;
  if v_id is null then return false; end if;
  insert into betting_records(id, prediction_id, odds_at_publication, stake_units, settlement_rule)
    values('bet-' || v_id, v_id, (p_tip->>'odds')::numeric, 1, '90_minutes_including_stoppage_no_extra_time');
  return true;
end $$;

-- Atomically settle both records. Repeated calls preserve the original result.
create or replace function public.settle_pipeline_tip(p_prediction_id text, p_outcome text)
returns boolean language plpgsql set search_path = public as $$
declare v_prediction predictions;
begin
  if p_outcome is null or p_outcome not in ('win','loss','void','push') then raise exception 'Invalid outcome'; end if;
  select * into v_prediction from predictions where id = p_prediction_id for update;
  if not found or v_prediction.status in ('settled','void') then return false; end if;
  perform 1 from betting_records where prediction_id = p_prediction_id for update;
  if not found then raise exception 'Missing publication odds'; end if;
  update betting_records set net_return_units = case p_outcome
    when 'win' then stake_units * (odds_at_publication - 1)
    when 'loss' then -stake_units else 0 end, settled_at = now(), updated_at = now()
    where prediction_id = p_prediction_id;
  perform settle_prediction(p_prediction_id, p_outcome, now());
  return true;
end $$;

revoke all on function public.record_pipeline_usage(text, integer, integer, text) from public, anon, authenticated;
revoke all on function public.publish_pipeline_tip(jsonb, integer) from public, anon, authenticated;
revoke all on function public.settle_pipeline_tip(text, text) from public, anon, authenticated;
grant execute on function public.record_pipeline_usage(text, integer, integer, text) to service_role;
grant execute on function public.publish_pipeline_tip(jsonb, integer) to service_role;
grant execute on function public.settle_pipeline_tip(text, text) to service_role;
