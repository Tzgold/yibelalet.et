import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Supabase publication and settlement transactions', () => {
  const db = new PGlite();
  beforeAll(async () => {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql as 'select null::uuid';`);
    const base = readFileSync('supabase/migrations/20261012170000_football_leaderboard.sql', 'utf8')
      .replace('create extension if not exists "pgcrypto";', '');
    await db.exec(base);
    await db.exec(readFileSync('supabase/migrations/20261021090000_prediction_pipeline.sql', 'utf8'));
    await db.exec(`insert into competitions(id,name,short_name,country) values('c','League','L','England');
      insert into teams(id,name,short_name) values('h','Home','H'),('a','Away','A');
      insert into predictor_profiles(id,slug,display_name,handle,profile_type,join_date)
        values('p','strategy','Strategy','strategy','ai',current_date);
      insert into football_matches(id,competition_id,home_team_id,away_team_id,kickoff_at,match_status)
        values('m','c','h','a',now()+interval '1 day','scheduled'),
          ('late','c','h','a',now()-interval '1 minute','scheduled'),
          ('m2','c','h','a',now()+interval '1 day','scheduled');`);
  }, 30_000);
  afterAll(async () => { await db.close(); });

  const tip = (id: string, match = 'm', odds = 2.5) => ({
    id, profile_id: 'p', match_id: match, market_type: 'match_result', selection: 'home',
    probability: 0.6, published_at: new Date().toISOString(), model_version: 'test',
    source_metadata: '{}', note: 'Analysis', odds,
  });
  async function publish(value: ReturnType<typeof tip>, cap = 3) {
    const result = await db.query<{ published: boolean }>('select publish_pipeline_tip($1::jsonb,$2) as published', [JSON.stringify(value), cap]);
    return result.rows[0].published;
  }
  it('blocks post-kickoff publication', async () => {
    expect(await publish(tip('late-tip', 'late'))).toBe(false);
  });
  it('rolls back the prediction if publication odds are invalid', async () => {
    await expect(publish(tip('bad', 'm', 1))).rejects.toThrow();
    expect((await db.query('select * from predictions')).rows).toHaveLength(0);
  });
  it('publishes once, enforces the cap, and preserves the original odds', async () => {
    expect(await publish(tip('original'))).toBe(true);
    expect(await publish(tip('retry', 'm', 9))).toBe(false);
    expect(await publish(tip('over-cap', 'm2'), 1)).toBe(false);
    const bets = await db.query<{ odds_at_publication: string }>('select odds_at_publication from betting_records');
    expect(bets.rows).toHaveLength(1);
    expect(Number(bets.rows[0].odds_at_publication)).toBe(2.5);
    await expect(db.exec("update predictions set selection='away' where id='original'")).rejects.toThrow('Locked predictions');
  });
  it('settles both records once and does not overwrite the result on retry', async () => {
    expect((await db.query<{ settled: boolean }>("select settle_pipeline_tip('original','win') as settled")).rows[0].settled).toBe(true);
    expect((await db.query<{ settled: boolean }>("select settle_pipeline_tip('original','loss') as settled")).rows[0].settled).toBe(false);
    const result = await db.query<{ settlement_outcome: string; net_return_units: string }>(`select settlement_outcome, net_return_units from predictions p join betting_records b on b.prediction_id=p.id where p.id='original'`);
    expect(result.rows[0].settlement_outcome).toBe('win');
    expect(Number(result.rows[0].net_return_units)).toBe(1.5);
  });
  it('denies pipeline RPC execution to anonymous and signed-in users', async () => {
    for (const role of ['anon', 'authenticated']) {
      const permissions = await db.query<{ allowed: boolean }>(`select has_function_privilege($1, 'public.publish_pipeline_tip(jsonb,integer)', 'EXECUTE') as allowed`, [role]);
      expect(permissions.rows[0].allowed).toBe(false);
    }
  });
});
