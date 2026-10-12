import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="surface mx-auto max-w-lg rounded-xl p-8 text-center">
        <h1 className="text-xl font-semibold">Profile not found</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          That predictor slug does not exist or is not public.
        </p>
        <Link
          href="/leaderboard"
          className="focus-ring mt-5 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#1a1208]"
        >
          Back to leaderboard
        </Link>
      </div>
    </AppShell>
  );
}
