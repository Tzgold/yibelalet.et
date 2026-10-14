"use client";

import { ImagePanelCard } from "@/components/ui/ImagePanelCard";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";
import { useT } from "@/i18n/I18nProvider";

const IMAGES = [
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85",
] as const;

export function LandingAbout() {
  const t = useT();

  const items = [
    {
      title: t("about.item1Title"),
      body: t("about.item1Body"),
      image: IMAGES[0],
    },
    {
      title: t("about.item2Title"),
      body: t("about.item2Body"),
      image: IMAGES[1],
    },
    {
      title: t("about.item3Title"),
      body: t("about.item3Body"),
      image: IMAGES[2],
    },
  ];

  return (
    <section id="about" className="scroll-mt-20 py-12">
      <LinedSectionTitle>{t("about.title")}</LinedSectionTitle>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-muted)]">
        {t("about.subtitle")}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
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
