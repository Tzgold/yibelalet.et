import Link from "next/link";
import { MIN_SAMPLE_SIZE } from "@/domain/metrics";
import { ImagePanelCard } from "@/components/ui/ImagePanelCard";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";

const STEPS = [
  {
    title: "Predictions before kickoff",
    body: "Each tip is timestamped and locked at kickoff — no silent edits after the cutoff.",
    eyebrow: "Step 01",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Same scoring for everyone",
    body: "Human tipsters and AI models use identical settlement rules and ranking formulas.",
    eyebrow: "Step 02",
    image:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Sample size matters",
    body: `At least ${MIN_SAMPLE_SIZE} settled win/loss tips in the selected period to rank. Smaller samples stay visible but marked insufficient.`,
    eyebrow: "Step 03",
    image:
      "https://images.unsplash.com/photo-1489944440615-938acbe316d0?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Accuracy vs profit",
    body: "Accuracy is always shown from settled tips. Profit and ROI appear only when betting records exist.",
    eyebrow: "Step 04",
    image:
      "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1600&q=85",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-12">
      <LinedSectionTitle>Methodology</LinedSectionTitle>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-muted)]">
        Documented rules behind the leaderboard.{" "}
        <Link href="/how-it-works" className="text-[var(--accent)] hover:underline">
          Full docs →
        </Link>
      </p>

      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {STEPS.map((step) => (
          <li key={step.title}>
            <ImagePanelCard
              imageUrl={step.image}
              eyebrow={step.eyebrow}
              title={step.title}
              body={step.body}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
