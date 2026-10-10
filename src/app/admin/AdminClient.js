"use client";

import { useState } from "react";
import { useI18n } from "@/app/providers";
import { Badge } from "@/components/ui";
import StatsTab from "./StatsTab";
import StationsTab from "./StationsTab";
import RewardsTab from "./RewardsTab";
import EventsTab from "./EventsTab";
import UsersTab from "./UsersTab";
import DemoResetButton from "./DemoResetButton";

const TABS = [
  { key: "stats", labelKey: "admin.stats", Component: StatsTab },
  { key: "stations", labelKey: "admin.stations", Component: StationsTab },
  { key: "rewards", labelKey: "admin.rewards", Component: RewardsTab },
  { key: "events", labelKey: "admin.events", Component: EventsTab },
  { key: "users", labelKey: "admin.users", Component: UsersTab },
];

export default function AdminClient() {
  const { t } = useI18n();
  const [tab, setTab] = useState("stats");
  const Active = TABS.find((x) => x.key === tab)?.Component ?? StatsTab;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge tone="amber">Admin-only — server-enforced</Badge>
          <h1 className="text-3xl font-extrabold mt-2">{t("admin.title")}</h1>
        </div>
        <DemoResetButton />
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              tab === tb.key ? "bg-eco-600 text-white" : "text-slate-500"
            }`}
          >
            {t(tb.labelKey)}
          </button>
        ))}
      </div>

      <Active />
    </div>
  );
}
