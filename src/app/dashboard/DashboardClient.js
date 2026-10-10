"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Recycle,
  Coins,
  Wind,
  Award,
  History,
  MapPin,
  Camera,
  Sparkles,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useI18n } from "@/app/providers";
import { api } from "@/components/ApiClient";
import { Card, StatCard, Skeleton, EmptyState, Badge } from "@/components/ui";
import { MATERIAL_META } from "@/lib/constants";

export default function DashboardClient() {
  const { t, lang } = useI18n();
  const [granularity, setGranularity] = useState("daily");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get("/api/dashboard/summary"),
  });

  const { data: trend } = useQuery({
    queryKey: ["dashboard-trend", granularity],
    queryFn: () => api.get(`/api/dashboard/trend?granularity=${granularity}`),
  });

  const { data: stationsData } = useQuery({
    queryKey: ["stations"],
    queryFn: () => api.get("/api/stations"),
  });

  const { data: challengesData } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => api.get("/api/challenges"),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const nearestStation = stationsData?.stations?.[0];
  const activeChallenges = (challengesData?.challenges ?? []).slice(0, 3);

  return (
    <div className="space-y-8 fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-eco-900 via-eco-800 to-eco-700 text-white p-8 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-lime-500/20 text-lime-400 text-xs font-semibold mb-4 border border-lime-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("dashboard.welcome")}, {data.user?.name}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {t("dashboard.title")}
          </h1>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-lime-500 hover:bg-lime-400 text-eco-900 font-bold px-6 py-3.5 rounded-2xl shadow-lg transition"
          >
            <Camera className="w-5 h-5" />
            <span>{t("dashboard.cta")}</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Recycle} label={t("dashboard.recycled")} value={`${data.totalRecycledKg} ${t("common.kg")}`} accent="eco" />
        <StatCard icon={Coins} label={t("dashboard.tokens")} value={data.balance} accent="amber" />
        <StatCard icon={Wind} label={t("dashboard.co2")} value={`${data.co2SavedKg} ${t("common.kg")}`} accent="sky" />
        <StatCard icon={Award} label={t("dashboard.rank")} value={data.rank ? `#${data.rank}` : "—"} accent="purple" />
      </div>

      {/* Trend + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold">{t("dashboard.recentActivity")}</h2>
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
              {["daily", "weekly", "monthly", "yearly"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    granularity === g ? "bg-eco-600 text-white" : "text-slate-500"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend?.series ?? []}>
                <defs>
                  <linearGradient id="kgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="kg" stroke="#16a34a" fill="url(#kgGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4">{t("dashboard.breakdown")}</h2>
          {data.breakdown.length === 0 ? (
            <EmptyState icon={Recycle} title={t("common.loading") === "" ? "" : "—"} />
          ) : (
            <div className="h-48 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.breakdown} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="material" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="kg" fill="#65a30d" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Recent activity + nearest station */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-eco-600" />
              <span>{t("dashboard.recentActivity")}</span>
            </h2>
          </div>
          {data.recentActivity.length === 0 ? (
            <EmptyState icon={History} title="—" />
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((ev) => {
                const meta = MATERIAL_META[ev.material];
                return (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-4 rounded-2xl surface"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Recycle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{ev.estimatedKg}kg {ev.material}</h4>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {ev.station?.name} • {new Date(ev.createdAt).toLocaleDateString(lang)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-eco-600">+{ev.tokensAwarded} {t("common.tokens")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-eco-600" />
              <span>{t("dashboard.nearestStation")}</span>
            </h2>
            {nearestStation ? (
              <div className="rounded-2xl p-4 surface mb-4">
                <h4 className="text-sm font-bold mb-1">{nearestStation.name}</h4>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{nearestStation.address}</p>
                <Badge tone="eco">{t("map.demoLocations")}</Badge>
              </div>
            ) : (
              <EmptyState icon={MapPin} title="—" />
            )}

            <h3 className="text-sm font-bold mb-2 flex items-center gap-2 mt-4">
              <Target className="w-4 h-4 text-eco-600" />
              <span>{t("dashboard.activeChallenges")}</span>
            </h3>
            <div className="space-y-2">
              {activeChallenges.map((c) => (
                <div key={c.id} className="text-xs p-3 rounded-xl surface">
                  <p className="font-semibold">{c.title}</p>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-eco-600"
                      style={{
                        width: `${Math.min(100, ((c.myParticipation?.progress ?? 0) / c.goalValue) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/map"
            className="w-full mt-4 py-3 bg-eco-800 hover:bg-eco-900 text-white font-semibold rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <MapPin className="w-4 h-4" />
            <span>{t("nav.map")}</span>
          </Link>
        </Card>
      </div>
    </div>
  );
}
