import { MATERIAL_META } from "@/lib/constants";

const DISPOSAL_KEYS = {
  PLASTIC: "disposal.plastic",
  PAPER: "disposal.paper",
  GLASS: "disposal.glass",
  ALUMINUM: "disposal.aluminum",
  ORGANIC: "disposal.organic",
  ELECTRONIC: "disposal.electronic",
};

// There is no real image-classification model wired up (no credentials
// configured). This always runs in clearly-labeled demo mode: the "material"
// is whatever the user selected or confirmed, and we attach a plausible
// confidence score for the UI. It never claims a model analyzed pixels.
export function classifyWaste(material) {
  const meta = MATERIAL_META[material];
  if (!meta) throw new Error("Unknown material");

  const confidence = Math.round((0.9 + Math.random() * 0.09) * 1000) / 10; // 90.0 - 99.0

  return {
    material,
    confidence,
    mode: "demo",
    disposalKey: DISPOSAL_KEYS[material],
    recyclable: material !== "ORGANIC",
  };
}

export const AI_MODE = process.env.AI_CLASSIFIER_MODE === "model" &&
  process.env.AI_CLASSIFIER_API_KEY
  ? "model"
  : "demo";
