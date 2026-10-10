"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, MapPin, Recycle, Wind, Coins, Gift, Clock } from "lucide-react";
import { api } from "@/components/ApiClient";
import { StatCard, Skeleton } from "@/components/ui";

export default function StatsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/api/admin/stats"),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Users} label="Users" value={data.userCount} accent="eco" />
      <StatCard icon={MapPin} label="Active Stations" value={data.stationCount} accent="sky" />
      <StatCard icon={Recycle} label="Total Recycled (kg)" value={data.totalRecycledKg} accent="eco" />
      <StatCard icon={Wind} label="CO2 Avoided (kg)" value={data.totalCo2SavedKg} accent="sky" />
      <StatCard icon={Coins} label="Tokens Awarded" value={data.totalTokensAwarded} accent="amber" />
      <StatCard icon={Gift} label="Redemptions" value={data.redemptionCount} accent="purple" />
      <StatCard icon={Clock} label="Pending Events" value={data.pendingEvents} accent="amber" />
    </div>
  );
}
