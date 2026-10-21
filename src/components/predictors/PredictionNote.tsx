"use client";

import type { Prediction } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";

export function PredictionNote({ prediction }: { prediction: Pick<Prediction, "note" | "sourceMetadata"> }) {
  const { locale } = useI18n();
  let note = prediction.note;
  if (locale === "am" && prediction.sourceMetadata) {
    try {
      const metadata: unknown = JSON.parse(prediction.sourceMetadata);
      if (metadata && typeof metadata === "object" && "rationaleAm" in metadata && typeof metadata.rationaleAm === "string" && metadata.rationaleAm.trim()) {
        note = metadata.rationaleAm;
      }
    } catch { /* Older/manual tips may have plain-text source metadata. */ }
  }
  return <>{note}</>;
}
