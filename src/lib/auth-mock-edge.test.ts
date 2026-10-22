import { afterEach, describe, expect, it, vi } from "vitest";
import { isAuthMockEnabled } from "./auth-mock-edge";

afterEach(() => vi.unstubAllEnvs());

describe("local mock authentication", () => {
  it("is opt-in during development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_MOCK", "false");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MOCK", "false");
    expect(isAuthMockEnabled()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_AUTH_MOCK", "true");
    expect(isAuthMockEnabled()).toBe(true);
  });

  it("accepts the server flag in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_MOCK", "true");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MOCK", "false");
    expect(isAuthMockEnabled()).toBe(true);
  });

  it("stays disabled in production even when both flags are enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_MOCK", "true");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MOCK", "true");
    expect(isAuthMockEnabled()).toBe(false);
  });
});
