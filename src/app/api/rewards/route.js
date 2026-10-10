import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async (req) => {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const rewards = await prisma.reward.findMany({
    where: {
      isActive: true,
      ...(category && category !== "all" ? { category } : {}),
    },
    orderBy: { tokenCost: "asc" },
  });

  return ok({ rewards });
});
