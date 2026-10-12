import { AppShell } from "@/components/layout/AppShell";

export default function PrivacyPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-xl font-semibold">Privacy</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Yibelalet is currently a development build. Public leaderboard and profile pages expose
          only intentionally public predictor data. Authentication and personal accounts are not
          enabled in this build. When accounts ship, this page will describe collection and
          retention practices in detail.
        </p>
      </article>
    </AppShell>
  );
}
