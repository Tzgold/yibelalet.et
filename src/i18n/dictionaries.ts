import enJson from "./en.json";
import amJson from "./am.json";

export type Dictionary = typeof enJson;

export const en = enJson;
export const am = amJson as Dictionary;

export const dictionaries: Record<"en" | "am", Dictionary> = {
  en,
  am,
};
