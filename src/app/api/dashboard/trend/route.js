import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

const RANGE_DAYS = { daily: 14, weekly: 56, monthly: 365, yearly: 365 * 3 };

export const GET = withApiError(async (req) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const granularity = searchParams.get("granularity") || "daily";
  const days = RANGE_DAYS[granularity] ?? 14;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.recyclingEvent.findMany({
    where: { userId: user.id, status: "VERIFIED", createdAt: { gte: since } },
    select: { estimatedKg: true, tokensAwarded: true, createdAt: true },
  });

  const bucketKey = (date) => {
    if (granularity === "daily") return date.toISOString().slice(0, 10);
    if (granularity === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().slice(0, 10);
    }
    if (granularity === "yearly") return String(date.getFullYear());
    return date.toISOString().slice(0, 7); // monthly
  };

  const buckets = new Map();
  for (const e of events) {
    const key = bucketKey(e.createdAt);
    const cur = buckets.get(key) ?? { period: key, kg: 0, tokens: 0 };
    cur.kg += e.estimatedKg;
    cur.tokens += e.tokensAwarded;
    buckets.set(key, cur);
  }

  const series = Array.from(buckets.values())
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((b) => ({ ...b, kg: Math.round(b.kg * 100) / 100 }));

  return ok({ series, granularity });
});
