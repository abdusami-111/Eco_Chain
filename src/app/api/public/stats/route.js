import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

// Public, unauthenticated aggregate stats for the landing page. No PII —
// totals only. This is real data from the demo environment, not a
// fabricated marketing number.
export const GET = withApiError(async () => {
  const [userCount, stationCount, eventAgg] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.station.count({ where: { isActive: true } }),
    prisma.recyclingEvent.aggregate({
      where: { status: "VERIFIED" },
      _sum: { estimatedKg: true, co2SavedKg: true, tokensAwarded: true },
    }),
  ]);

  return ok({
    userCount,
    stationCount,
    totalRecycledKg: Math.round((eventAgg._sum.estimatedKg ?? 0) * 10) / 10,
    totalCo2SavedKg: Math.round((eventAgg._sum.co2SavedKg ?? 0) * 10) / 10,
    totalTokensAwarded: eventAgg._sum.tokensAwarded ?? 0,
  });
});
