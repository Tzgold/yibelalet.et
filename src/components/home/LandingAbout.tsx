import { ImagePanelCard } from "@/components/ui/ImagePanelCard";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";

const ITEMS = [
  {
    title: "Verified records",
    body: "Every prediction is timestamped before kickoff and locked — no silent edits after the cutoff.",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Fair comparison",
    body: "The same scoring rules and minimum sample size apply to every human tipster and AI model.",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85",
  },
  {
    title: "Full transparency",
    body: "Explore accuracy, calibration, sample size, and performance over time after you sign in.",
    image:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85",
  },
] as const;

export function LandingAbout() {
  return (
    <section id="about" className="scroll-mt-20 py-12">
      <LinedSectionTitle>About</LinedSectionTitle>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-muted)]">
        Why our rankings are trustworthy — recorded performance, not highlight reels.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <ImagePanelCard
            key={item.title}
            imageUrl={item.image}
            title={item.title}
            body={item.body}
          />
        ))}
      </div>
    </section>
  );
}
