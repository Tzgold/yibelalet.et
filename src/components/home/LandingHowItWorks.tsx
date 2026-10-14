"use client";

import Link from "next/link";
import { MIN_SAMPLE_SIZE } from "@/domain/metrics";
import { ImagePanelCard } from "@/components/ui/ImagePanelCard";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";
import { useT } from "@/i18n/I18nProvider";

const STEP_IMAGES = [
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1489944440615-938acbe316d0?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1600&q=85",
] as const;

export function LandingHowItWorks() {
  const t = useT();

  const steps = [
    {
      title: t("how.step1Title"),
      body: t("how.step1Body"),
      eyebrow: t("how.step1Eyebrow"),
      image: STEP_IMAGES[0],
    },
    {
      title: t("how.step2Title"),
      body: t("how.step2Body"),
      eyebrow: t("how.step2Eyebrow"),
      image: STEP_IMAGES[1],
    },
    {
      title: t("how.step3Title"),
      body: t("how.step3Body", { min: MIN_SAMPLE_SIZE }),
      eyebrow: t("how.step3Eyebrow"),
      image: STEP_IMAGES[2],
    },
    {
      title: t("how.step4Title"),
      body: t("how.step4Body"),
      eyebrow: t("how.step4Eyebrow"),
      image: STEP_IMAGES[3],
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 py-12">
      <LinedSectionTitle>{t("how.title")}</LinedSectionTitle>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-muted)]">
        {t("how.subtitle")}{" "}
        <Link href="/how-it-works" className="text-[var(--accent)] hover:underline">
          {t("how.fullDocs")}
        </Link>
      </p>

      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
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
