import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserBalance } from "@/lib/ledger";
import { ok, withApiError } from "@/lib/api";
import { MATERIALS } from "@/lib/constants";

export const GET = withApiError(async () => {
  const user = await requireUser();

  const [balance, events, recentActivity, achievements, rank] = await Promise.all([
    getUserBalance(prisma, user.id),
    prisma.recyclingEvent.findMany({
      where: { userId: user.id, status: "VERIFIED" },
    }),
    prisma.recyclingEvent.findMany({
      where: { userId: user.id, status: "VERIFIED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { station: true },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
    }),
    computeRank(user.id),
  ]);

  const totalRecycledKg = events.reduce((sum, e) => sum + e.estimatedKg, 0);
  const co2SavedKg = events.reduce((sum, e) => sum + e.co2SavedKg, 0);

  const breakdown = MATERIALS.map((m) => ({
    material: m,
    kg: Math.round(events.filter((e) => e.material === m).reduce((s, e) => s + e.estimatedKg, 0) * 100) / 100,
  })).filter((b) => b.kg > 0);

  return ok({
    user,
    balance,
    totalRecycledKg: Math.round(totalRecycledKg * 100) / 100,
    co2SavedKg: Math.round(co2SavedKg * 100) / 100,
    breakdown,
    recentActivity,
    achievements,
    rank,
  });
});

async function computeRank(userId) {
  const grouped = await prisma.recyclingEvent.groupBy({
    by: ["userId"],
    where: { status: "VERIFIED" },
    _sum: { tokensAwarded: true },
  });
  const sorted = grouped.sort((a, b) => (b._sum.tokensAwarded ?? 0) - (a._sum.tokensAwarded ?? 0));
  const idx = sorted.findIndex((g) => g.userId === userId);
  return idx === -1 ? null : idx + 1;
}
