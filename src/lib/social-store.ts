import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

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
  const store = await readStore();
  return store.follows.filter((f) => f.profileId === profileId).length;
}

export async function isFollowing(followerId: string, profileId: string) {
  const store = await readStore();
  return store.follows.some(
    (f) => f.followerId === followerId && f.profileId === profileId,
  );
}

export async function toggleFollow(followerId: string, profileId: string) {
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
  };
  store.subscriptions = store.subscriptions.filter((s) => s.txRef !== input.txRef);
  store.subscriptions.push(sub);
  await writeStore(store);
  return sub;
}

export async function activateSubscriptionByTxRef(txRef: string) {
  const store = await readStore();
  const sub = store.subscriptions.find((s) => s.txRef === txRef);
  if (!sub) return null;
  sub.status = "active";
  await writeStore(store);
  return sub;
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
