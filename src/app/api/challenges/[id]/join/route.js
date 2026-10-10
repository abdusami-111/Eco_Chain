import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApiError } from "@/lib/api";

export const POST = withApiError(async (_req, { params }) => {
  const user = await requireUser();
  const { id: challengeId } = await params;

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || !challenge.isActive) return fail("Challenge not found", 404);

  const participant = await prisma.challengeParticipant.upsert({
    where: { challengeId_userId: { challengeId, userId: user.id } },
    update: {},
    create: { challengeId, userId: user.id },
  });

  return ok({ participant });
});
