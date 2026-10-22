import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isAuthMockEnabled } from "@/lib/auth-mock-edge";

function localPreview() { return isAuthMockEnabled() || (process.env.NODE_ENV==='development' && process.env.LEADERBOARD_DATA_SOURCE==='demo'); }
function checked(error:{message:string}|null) { if(error)throw new Error('Subscription storage unavailable. Apply the matchday subscription migration.'); }

export type SocialStore = {
  follows: Array<{ followerId: string; profileId: string; createdAt: string }>;
  subscriptions: Array<{
    id: string;
    userId: string;
    profileId: string;
    txRef: string;
    amountEtb: number;
    status: "pending" | "active" | "expired";
    createdAt: string;
    expiresAt: string;
    durationDays?: number;
    activatedAt?: string;
  }>;
};

function storePath() {
  return path.join(process.cwd(), ".data", "social.json");
}

async function readStore(): Promise<SocialStore> {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as SocialStore;
    return {
      follows: Array.isArray(parsed.follows) ? parsed.follows : [],
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
    };
  } catch {
    return { follows: [], subscriptions: [] };
  }
}

async function writeStore(store: SocialStore) {
  const dir = path.dirname(storePath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(store, null, 2), "utf8");
}

export async function getFollowerCount(profileId: string) {
  if(!localPreview()) {
    const {count,error}=await createSupabaseAdminClient().from('profile_follows').select('*',{count:'exact',head:true}).eq('profile_id',profileId);
    checked(error);return count??0;
  }
  const store = await readStore();
  return store.follows.filter((f) => f.profileId === profileId).length;
}

export async function isFollowing(followerId: string, profileId: string) {
  if(!localPreview()) {
    const {data,error}=await createSupabaseAdminClient().from('profile_follows').select('profile_id').eq('profile_id',profileId).eq('follower_user_id',followerId).maybeSingle();
    checked(error);return Boolean(data);
  }
  const store = await readStore();
  return store.follows.some(
    (f) => f.followerId === followerId && f.profileId === profileId,
  );
}

export async function toggleFollow(followerId: string, profileId: string) {
  if(!localPreview()) {
    const db=createSupabaseAdminClient(),following=await isFollowing(followerId,profileId);
    const result=following?await db.from('profile_follows').delete().eq('follower_user_id',followerId).eq('profile_id',profileId):await db.from('profile_follows').upsert({follower_user_id:followerId,profile_id:profileId});
    checked(result.error);return {following:!following,followerCount:await getFollowerCount(profileId)};
  }
  const store = await readStore();
  const idx = store.follows.findIndex(
    (f) => f.followerId === followerId && f.profileId === profileId,
  );
  if (idx >= 0) {
    store.follows.splice(idx, 1);
    await writeStore(store);
    return {
      following: false,
      followerCount: store.follows.filter((f) => f.profileId === profileId).length,
    };
  }
  store.follows.push({
    followerId,
    profileId,
    createdAt: new Date().toISOString(),
  });
  await writeStore(store);
  return {
    following: true,
    followerCount: store.follows.filter((f) => f.profileId === profileId).length,
  };
}

export async function hasActiveSubscription(userId: string, profileId: string) {
  if(!localPreview()) {
    const {data,error}=await createSupabaseAdminClient().from('profile_subscriptions').select('id').eq('user_id',userId).eq('profile_id',profileId).eq('status','active').gt('expires_at',new Date().toISOString()).limit(1);
    checked(error);return Boolean(data?.length);
  }
  const store = await readStore();
  const now = Date.now();
  return store.subscriptions.some(
    (s) =>
      s.userId === userId &&
      s.profileId === profileId &&
      s.status === "active" &&
      new Date(s.expiresAt).getTime() > now,
  );
}

export async function createPendingSubscription(input: {
  userId: string;
  profileId: string;
  amountEtb: number;
  txRef: string;
  days?: number;
}) {
  if(!localPreview()) {
    const {data,error}=await createSupabaseAdminClient().from('profile_subscriptions').insert({id:randomUUID(),user_id:input.userId,profile_id:input.profileId,tx_ref:input.txRef,amount_etb:input.amountEtb,duration_days:input.days??30,status:'pending'}).select().single();
    checked(error);return mapSubscription(data!);
  }
  const store = await readStore();
  const days = input.days ?? 30;
  const sub = {
    id: randomUUID(),
    userId: input.userId,
    profileId: input.profileId,
    txRef: input.txRef,
    amountEtb: input.amountEtb,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: days,
  };
  store.subscriptions = store.subscriptions.filter((s) => s.txRef !== input.txRef);
  store.subscriptions.push(sub);
  await writeStore(store);
  return sub;
}

export async function activateSubscriptionByTxRef(txRef: string) {
  if(!localPreview()) {
    const {data,error}=await createSupabaseAdminClient().rpc('activate_profile_subscription',{p_tx_ref:txRef});
    checked(error);return data?.id?mapSubscription(data):null;
  }
  const store = await readStore();
  const sub = store.subscriptions.find((s) => s.txRef === txRef);
  if (!sub) return null;
  if(sub.status!=='pending')return sub;
  sub.status = "active";
  const duration=sub.durationDays??Math.max(1,Math.round((new Date(sub.expiresAt).getTime()-new Date(sub.createdAt).getTime())/86400000));
  sub.activatedAt=new Date().toISOString();
  sub.expiresAt=new Date(Date.now()+duration*86400000).toISOString();
  await writeStore(store);
  return sub;
}

function mapSubscription(row:Record<string,unknown>):SocialStore['subscriptions'][number] {
  return {id:String(row.id),userId:String(row.user_id),profileId:String(row.profile_id),txRef:String(row.tx_ref),amountEtb:Number(row.amount_etb),durationDays:Number(row.duration_days),status:row.status as 'pending'|'active'|'expired',createdAt:String(row.created_at),expiresAt:row.expires_at?String(row.expires_at):'',activatedAt:row.activated_at?String(row.activated_at):undefined};
}

export async function getSubscriptionByTxRef(txRef:string) {
  if(localPreview())return (await readStore()).subscriptions.find(s=>s.txRef===txRef)??null;
  const {data,error}=await createSupabaseAdminClient().from('profile_subscriptions').select('*').eq('tx_ref',txRef).maybeSingle();
  checked(error);return data?mapSubscription(data):null;
}

export async function getSocialStatus(userId: string | null, profileId: string) {
  const followerCount = await getFollowerCount(profileId);
  if (!userId) {
    return {
      followerCount,
      following: false,
      subscribed: false,
    };
  }
  return {
    followerCount,
    following: await isFollowing(userId, profileId),
    subscribed: await hasActiveSubscription(userId, profileId),
  };
}
