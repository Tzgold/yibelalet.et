"use client";

import { ImagePanelCard } from "@/components/ui/ImagePanelCard";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";
import { useT } from "@/i18n/I18nProvider";

const STEP_IMAGES = [
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1489944440615-938acbe316d0?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85",
] as const;

const STEP_KEYS = [
  { title: "howPage.step1Title", body: "howPage.step1Body" },
  { title: "howPage.step2Title", body: "howPage.step2Body" },
  { title: "howPage.step3Title", body: "howPage.step3Body" },
  { title: "howPage.step4Title", body: "howPage.step4Body" },
  { title: "howPage.step5Title", body: "howPage.step5Body" },
] as const;

export function HowItWorksClient() {
  const t = useT();

  return (
    <article className="mx-auto max-w-4xl">
      <header className="mb-10">
        <LinedSectionTitle as="h1">{t("howPage.title")}</LinedSectionTitle>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[var(--text-muted)]">
          {t("howPage.intro")}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {STEP_KEYS.map((step, index) => (
          <ImagePanelCard
            key={step.title}
            imageUrl={STEP_IMAGES[index]}
            eyebrow={`Step ${String(index + 1).padStart(2, "0")}`}
            title={t(step.title)}
            body={t(step.body)}
            className={index === STEP_KEYS.length - 1 ? "md:col-span-2" : ""}
          />
        ))}
      </div>
    </article>
  );
}
