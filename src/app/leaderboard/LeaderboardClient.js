"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api } from "@/components/ApiClient";
import { Card, Skeleton, EmptyState, Badge } from "@/components/ui";
import { useCurrentUser } from "@/components/useCurrentUser";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardClient() {
  const { t } = useI18n();
  const [period, setPeriod] = useState("allTime");
  const { data: me } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => api.get(`/api/leaderboard?period=${period}`),
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">{t("leaderboard.title")}</h1>
        {data?.you && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("leaderboard.you")}:</span>
            <span className="text-base font-bold text-amber-700 dark:text-amber-400">#{data.you.rank}</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
        {[
          ["weekly", t("leaderboard.weekly")],
          ["monthly", t("leaderboard.monthly")],
          ["allTime", t("leaderboard.allTime")],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              period === key ? "bg-eco-600 text-white" : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (data?.leaderboard ?? []).length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Trophy} title="—" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b text-xs uppercase font-semibold" style={{ borderColor: "var(--border-c)", color: "var(--text-muted)" }}>
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">kg</th>
                  <th className="py-4 px-6 text-right">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{ borderColor: "var(--border-c)" }}>
                {data.leaderboard.map((row) => {
                  const isYou = row.userId === me?.user?.id;
                  return (
                    <tr key={row.userId} className={isYou ? "bg-eco-50/60 dark:bg-eco-900/30" : ""}>
                      <td className="py-4 px-6 font-extrabold">
                        {MEDALS[row.rank - 1] ?? `#${row.rank}`}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-eco-600 text-white flex items-center justify-center font-bold text-xs">
                            {row.name?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold">{row.name} {isYou && `(${t("leaderboard.you")})`}</h4>
                            {row.district && <Badge tone="eco">{row.district}</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold">{row.recycledKg}</td>
                      <td className="py-4 px-6 text-right font-extrabold text-eco-600">{row.tokens}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
