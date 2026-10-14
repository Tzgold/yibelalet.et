import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  MOCK_AUTH_COOKIE,
  MOCK_OTP,
  type MockSession,
  decodeMockSession,
  encodeMockSession,
  isAuthMockEnabled,
} from "@/lib/auth-mock-edge";

export {
  MOCK_AUTH_COOKIE,
  MOCK_OTP,
  decodeMockSession,
  encodeMockSession,
  isAuthMockEnabled,
};
export type { MockSession };

type MockUser = {
  id: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

type PendingSignup = {
  phone: string;
  passwordHash: string;
  otp: string;
  expiresAt: number;
};

type MockStore = {
  users: MockUser[];
  pending: PendingSignup[];
};

function storePath() {
  return path.join(process.cwd(), ".data", "mock-auth.json");
}

export function hashPassword(password: string) {
  return createHash("sha256").update(`yibelalet:${password}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function readStore(): Promise<MockStore> {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as MockStore;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      pending: Array.isArray(parsed.pending) ? parsed.pending : [],
    };
  } catch {
    return { users: [], pending: [] };
  }
}

async function writeStore(store: MockStore) {
  const dir = path.dirname(storePath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(store, null, 2), "utf8");
}

export async function startMockRegistration(phone: string, password: string) {
  const store = await readStore();
  if (store.users.some((u) => u.phone === phone)) {
    return { ok: false as const, error: "This phone number is already registered." };
  }

  const passwordHash = hashPassword(password);
  const pending: PendingSignup = {
    phone,
    passwordHash,
    otp: MOCK_OTP,
    expiresAt: Date.now() + 15 * 60 * 1000,
  };
  store.pending = store.pending.filter((p) => p.phone !== phone);
  store.pending.push(pending);
  await writeStore(store);
  return { ok: true as const, otp: MOCK_OTP };
}

export async function verifyMockRegistration(phone: string, otp: string) {
  const store = await readStore();
  const pending = store.pending.find((p) => p.phone === phone);
  if (!pending) {
    return {
      ok: false as const,
      error: "No pending registration for this number. Start again.",
    };
  }
  if (pending.expiresAt < Date.now()) {
    store.pending = store.pending.filter((p) => p.phone !== phone);
    await writeStore(store);
    return { ok: false as const, error: "Code expired. Register again." };
  }
  if (!safeEqual(pending.otp, otp.trim())) {
    return {
      ok: false as const,
      error: "Invalid code. Use the mock OTP shown on screen.",
    };
  }

  const user: MockUser = {
    id: randomUUID(),
    phone,
    passwordHash: pending.passwordHash,
    createdAt: new Date().toISOString(),
  };
  store.users = store.users.filter((u) => u.phone !== phone);
  store.users.push(user);
  store.pending = store.pending.filter((p) => p.phone !== phone);
  await writeStore(store);
  return { ok: true as const, user };
}

export async function mockSignIn(phone: string, password: string) {
  const store = await readStore();
  const user = store.users.find((u) => u.phone === phone);
  if (!user) {
    return { ok: false as const, error: "No account for this number. Register first." };
  }
  if (!safeEqual(user.passwordHash, hashPassword(password))) {
    return { ok: false as const, error: "Incorrect password." };
  }
  return { ok: true as const, user };
}

export function createMockSession(user: { id: string; phone: string }): MockSession {
  return {
    id: user.id,
    phone: user.phone,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
}
