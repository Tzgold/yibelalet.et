import { AppShell } from "@/components/layout/AppShell";
import { ImagePanelCard } from "@/components/ui/ImagePanelCard";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";
import { MIN_SAMPLE_SIZE } from "@/domain/metrics";

const SECTIONS = [
  {
    title: "Predictions before kickoff",
    body: "Each tip stores a publication timestamp and a lock time at kickoff. After lock or settlement, selection and market fields cannot be silently changed.",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Accuracy",
    body: "Accuracy = wins ÷ (wins + losses). Voids and pushes are excluded from the denominator. Draw selections are wins when the match finishes level in a three-way match-result market.",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Sample size",
    body: `Profiles need at least ${MIN_SAMPLE_SIZE} settled win/loss predictions in the selected period to be ranking-eligible. Smaller samples remain visible but marked insufficient.`,
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Profit and ROI",
    body: "Net profit and ROI are shown only when betting records exist with odds, stake, and settlement returns. A correct forecast alone never invents financial performance.",
    image:
      "https://images.unsplash.com/photo-1489944440615-938acbe316d0?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Human vs AI",
    body: "Human tipsters and AI models use the same settlement and ranking formulas. Labels identify creator type — they do not imply superiority.",
    image:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85",
  },
];

export default function HowItWorksPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-4xl">
        <header className="mb-10">
          <LinedSectionTitle as="h1">How rankings work</LinedSectionTitle>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[var(--text-muted)]">
            Documented scoring rules used by the football leaderboard and profile analytics.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map((section, index) => (
            <ImagePanelCard
              key={section.title}
              imageUrl={section.image}
              eyebrow={`Step ${String(index + 1).padStart(2, "0")}`}
              title={section.title}
              body={section.body}
              className={index === SECTIONS.length - 1 ? "md:col-span-2" : ""}
            />
          ))}
        </div>
      </article>
    </AppShell>
  );
}
