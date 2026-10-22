import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll,afterAll,it,expect } from 'vitest';

const db=new PGlite();
const user='00000000-0000-0000-0000-000000000001';
beforeAll(async()=>{
  await db.exec(`create role anon;create role authenticated;create role service_role;
    create schema auth;create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.uid',true),'')::uuid$$;`);
  await db.exec(readFileSync('supabase/migrations/20261012170000_football_leaderboard.sql','utf8').replace('create extension if not exists "pgcrypto";',''));
  await db.exec(readFileSync('supabase/migrations/20261021090000_prediction_pipeline.sql','utf8'));
  const migration=readFileSync('supabase/migrations/20261022120000_matchday_subscriptions.sql','utf8');
  await db.exec(migration);
  await db.exec(migration); // Safe to reapply this additive policy migration.
  await db.exec(`grant usage on schema public,auth to anon,authenticated;
    grant select on all tables in schema public to anon,authenticated;
    insert into auth.users values('${user}');
    insert into competitions(id,name,short_name,country) values('c','League','L','England');
    insert into teams(id,name,short_name) values('h','Home','H'),('a','Away','A');
    insert into predictor_profiles(id,slug,display_name,handle,profile_type,join_date) values('p','p','P','p','ai',current_date),('q','q','Q','q','ai',current_date);
    insert into football_matches(id,competition_id,home_team_id,away_team_id,kickoff_at,match_status) values('m','c','h','a',now()+interval '1 day','scheduled');
    insert into predictions(id,profile_id,match_id,market_type,selection,published_at,locked_at,status) values
      ('open-p','p','m','match_result','home',now(),now(),'upcoming'),
      ('settled-p','p','m','double_chance','home_or_draw',now(),now(),'settled'),
      ('open-q','q','m','match_result','away',now(),now(),'upcoming');
    insert into profile_subscriptions(id,user_id,profile_id,tx_ref,amount_etb,duration_days) values
      ('00000000-0000-0000-0000-000000000002','${user}','p','verified',99,30);`);
},30000);
afterAll(async()=>{await db.close()});
async function readAs(role:'anon'|'authenticated') {
  await db.exec(`begin;set local role ${role}`);
  try {
    if(role==='authenticated')await db.query("select set_config('request.uid',$1,true)",[user]);
    return (await db.query<{id:string}>('select id from predictions order by id')).rows.map(r=>r.id);
  } finally {await db.exec('rollback');}
}
it('keeps open picks private through the direct Supabase API until a verified active subscription exists',async()=>{
  expect(await readAs('anon')).toEqual(['settled-p']);
  expect(await readAs('authenticated')).toEqual(['settled-p']);
  await db.exec("select activate_profile_subscription('verified')");
  expect(await readAs('authenticated')).toEqual(['open-p','settled-p']);
  expect(await readAs('anon')).toEqual(['settled-p']);
});
it('does not extend access on a duplicate callback and rejects expired access',async()=>{
  const first=await db.query<{expires_at:Date}>('select expires_at from profile_subscriptions');
  await db.exec("select activate_profile_subscription('verified')");
  expect((await db.query<{expires_at:Date}>('select expires_at from profile_subscriptions')).rows[0].expires_at).toEqual(first.rows[0].expires_at);
  await db.exec("update profile_subscriptions set expires_at=now()-interval '1 minute'");
  expect(await readAs('authenticated')).toEqual(['settled-p']);
  for(const role of ['anon','authenticated'])expect((await db.query<{allowed:boolean}>("select has_function_privilege($1,'public.activate_profile_subscription(text)','EXECUTE') allowed",[role])).rows[0].allowed).toBe(false);
});
