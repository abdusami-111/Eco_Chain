"use client";

import { GlassWater, Box, Wine, Cylinder, Apple, Cpu, AlertTriangle, Lightbulb } from "lucide-react";
import { useI18n } from "@/app/providers";
import { Card, Badge } from "@/components/ui";
import { MATERIALS } from "@/lib/constants";

const ICONS = { PLASTIC: GlassWater, PAPER: Box, GLASS: Wine, ALUMINUM: Cylinder, ORGANIC: Apple, ELECTRONIC: Cpu };

const CONTENT = {
  uz: {
    mistakes: [
      "Yuvilmagan idishlarni qayta ishlash qutisiga tashlash boshqa materiallarni ifloslaydi.",
      "Plastik qopchalarni alohida ajratmasdan tashlash saralash jarayonini qiyinlashtiradi.",
      "Elektron chiqindilarni oddiy axlat qutisiga tashlash atrof-muhitga zarar yetkazishi mumkin.",
    ],
    tip: "Haftalik maslahat: chiqindilarni tashlashdan oldin bir daqiqa ajratib, qaysi toifaga tegishli ekanini tekshiring — bu saralash sifatini sezilarli oshiradi.",
  },
  ru: {
    mistakes: [
      "Выбрасывание немытой тары в переработку загрязняет другие материалы.",
      "Смешивание пластиковых пакетов с остальными отходами усложняет сортировку.",
      "Электронные отходы в обычном контейнере могут нанести вред окружающей среде.",
    ],
    tip: "Совет недели: перед тем как выбросить отходы, потратьте минуту, чтобы проверить категорию — это заметно повышает качество сортировки.",
  },
  en: {
    mistakes: [
      "Throwing unwashed containers into recycling contaminates other materials.",
      "Mixing plastic bags in with other waste makes sorting harder downstream.",
      "E-waste in a regular bin can cause real environmental harm.",
    ],
    tip: "Weekly tip: take a minute to check the category before you toss something — it meaningfully improves sorting quality.",
  },
};

export default function LearnClient() {
  const { t, lang } = useI18n();
  const content = CONTENT[lang] ?? CONTENT.uz;

  return (
    <div className="space-y-8 fade-in max-w-4xl mx-auto">
      <div>
        <Badge tone="eco">EcoLearn</Badge>
        <h1 className="text-3xl font-extrabold mt-2">{t("nav.learn")}</h1>
      </div>

      <Card>
        <h2 className="text-lg font-bold mb-4">Material Guide</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {MATERIALS.map((m) => {
            const Icon = ICONS[m];
            return (
              <div key={m} className="surface rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-eco-600" />
                  <h3 className="font-bold text-sm">{m}</h3>
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t(`disposal.${m.toLowerCase()}`)}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Common Mistakes
        </h2>
        <ul className="space-y-2 text-sm list-disc pl-5" style={{ color: "var(--text-muted)" }}>
          {content.mistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </Card>

      <Card className="bg-eco-50 dark:bg-eco-900/30">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-eco-600" />
          Weekly Tip
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{content.tip}</p>
      </Card>

      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
        General guidance only — not a substitute for your local municipality&apos;s official recycling rules.
      </p>
    </div>
  );
}
