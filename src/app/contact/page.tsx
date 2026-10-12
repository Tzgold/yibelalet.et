import { AppShell } from "@/components/layout/AppShell";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";

export default function ContactPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl">
        <LinedSectionTitle as="h1">Contact</LinedSectionTitle>
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            For product questions about Yibelalet football prediction analytics, email{" "}
            <a
              href="mailto:hello@yibelalet.et"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              hello@yibelalet.et
            </a>
            .
          </p>
        </div>
      </article>
    </AppShell>
  );
}
