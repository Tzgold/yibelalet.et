import { AppShell } from "@/components/layout/AppShell";

export default function ContactPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-2xl space-y-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          For product questions about Yibelalet football prediction analytics, email{" "}
          <a
            href="mailto:hello@yibelalet.et"
            className="text-[var(--accent)] hover:underline"
          >
            hello@yibelalet.et
          </a>
          .
        </p>
      </article>
    </AppShell>
  );
}
