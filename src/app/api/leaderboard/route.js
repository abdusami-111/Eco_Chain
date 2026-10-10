import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ok, withApiError } from "@/lib/api";

function rangeFor(period) {
  const now = new Date();
  if (period === "weekly") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === "monthly") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(0);
}

export const GET = withApiError(async (req) => {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "allTime";
  const district = searchParams.get("district");
  const currentUser = await getCurrentUser();

  const since = rangeFor(period);

  const grouped = await prisma.recyclingEvent.groupBy({
    by: ["userId"],
    where: { status: "VERIFIED", createdAt: { gte: since } },
    _sum: { estimatedKg: true, tokensAwarded: true },
  });

  const userIds = grouped.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, isActive: true, ...(district ? { district } : {}) },
    select: { id: true, name: true, district: true, avatarUrl: true, city: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const rows = grouped
    .filter((g) => userMap[g.userId])
    .map((g) => ({
      userId: g.userId,
      name: userMap[g.userId].name,
      district: userMap[g.userId].district,
      city: userMap[g.userId].city,
      avatarUrl: userMap[g.userId].avatarUrl,
      recycledKg: Math.round((g._sum.estimatedKg ?? 0) * 100) / 100,
      tokens: g._sum.tokensAwarded ?? 0,
    }))
    .sort((a, b) => b.tokens - a.tokens)
    .map((row, idx) => ({ ...row, rank: idx + 1 }));

  const you = currentUser ? rows.find((r) => r.userId === currentUser.id) ?? null : null;

  return ok({ leaderboard: rows, you, period });
});
