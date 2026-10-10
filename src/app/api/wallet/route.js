import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserBalance } from "@/lib/ledger";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async (req) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const direction = searchParams.get("direction"); // CREDIT | DEBIT | null
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 15;

  const where = { userId: user.id, ...(direction ? { direction } : {}) };

  const [transactions, total, balance, earnedAgg, spentAgg] = await Promise.all([
    prisma.tokenTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tokenTransaction.count({ where }),
    getUserBalance(prisma, user.id),
    prisma.tokenTransaction.aggregate({
      where: { userId: user.id, direction: "CREDIT" },
      _sum: { amount: true },
    }),
    prisma.tokenTransaction.aggregate({
      where: { userId: user.id, direction: "DEBIT" },
      _sum: { amount: true },
    }),
  ]);

  return ok({
    balance,
    totalEarned: earnedAgg._sum.amount ?? 0,
    totalSpent: spentAgg._sum.amount ?? 0,
    transactions,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});
