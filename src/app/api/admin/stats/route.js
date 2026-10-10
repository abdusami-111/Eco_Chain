import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async () => {
  await requireRole("ADMIN");

  const [userCount, stationCount, eventAgg, redemptionCount, pendingEvents, tokenAgg] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.station.count({ where: { isActive: true } }),
      prisma.recyclingEvent.aggregate({
        where: { status: "VERIFIED" },
        _sum: { estimatedKg: true, co2SavedKg: true, tokensAwarded: true },
        _count: true,
      }),
      prisma.redemption.count(),
      prisma.recyclingEvent.count({ where: { status: "PENDING" } }),
      prisma.tokenTransaction.groupBy({ by: ["direction"], _sum: { amount: true } }),
    ]);

  return ok({
    userCount,
    stationCount,
    totalRecycledKg: Math.round((eventAgg._sum.estimatedKg ?? 0) * 100) / 100,
    totalCo2SavedKg: Math.round((eventAgg._sum.co2SavedKg ?? 0) * 100) / 100,
    totalTokensAwarded: eventAgg._sum.tokensAwarded ?? 0,
    verifiedEventCount: eventAgg._count,
    pendingEvents,
    redemptionCount,
    tokenFlow: tokenAgg,
  });
});
