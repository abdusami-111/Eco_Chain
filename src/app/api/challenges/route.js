import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async () => {
  const user = await getCurrentUser();
  const now = new Date();

  const challenges = await prisma.challenge.findMany({
    where: { isActive: true, endDate: { gte: now } },
    orderBy: { endDate: "asc" },
    include: user
      ? { participants: { where: { userId: user.id } } }
      : undefined,
  });

  const data = challenges.map((c) => ({
    ...c,
    participants: undefined,
    myParticipation: user ? c.participants?.[0] ?? null : null,
  }));

  return ok({ challenges: data });
});
