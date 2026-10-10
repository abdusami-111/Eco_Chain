import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async () => {
  const user = await requireUser();
  const redemptions = await prisma.redemption.findMany({
    where: { userId: user.id },
    include: { reward: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({ redemptions });
});
