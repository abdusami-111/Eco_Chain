import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendLedgerEntry } from "@/lib/ledger";
import { getRewardRule, computeReward } from "@/lib/rewardRules";
import { recalculateUserChallenges, grantAchievementOnce } from "@/lib/challenges";
import { ok, fail, withApiError } from "@/lib/api";

const schema = z.object({
  eventId: z.string().min(1),
  enteredCode: z.string().min(3).max(40),
});

const PENDING_TTL_MS = 10 * 60 * 1000;

// Step 2: the user enters the station's QR/demo code. The server — never
// the client — decides the material, the weight-derived reward, and
// whether this event has already been paid out. This is the only place
// EcoTokens get credited for a recycling activity.
export const POST = withApiError(async (req) => {
  const user = await requireUser();
  const { eventId, enteredCode } = schema.parse(await req.json());

  const event = await prisma.recyclingEvent.findUnique({
    where: { id: eventId },
    include: { station: true },
  });

  if (!event || event.userId !== user.id) return fail("Event not found", 404);
  if (event.status === "VERIFIED") return fail("scan.duplicateError", 409);
  if (event.status === "REJECTED") return fail("This event was rejected", 409);

  if (Date.now() - event.createdAt.getTime() > PENDING_TTL_MS) {
    await prisma.recyclingEvent.update({ where: { id: event.id }, data: { status: "REJECTED" } });
    return fail("Verification code expired, please scan again", 410);
  }

  const codeMatches =
    enteredCode.trim().toUpperCase() === event.station.qrCode.toUpperCase();
  if (!codeMatches) return fail("Incorrect station code", 400);

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
    // Re-read inside the transaction and guard the PENDING->VERIFIED
    // transition so two concurrent verify calls can't both pay out.
    const fresh = await tx.recyclingEvent.findUnique({ where: { id: event.id } });
    if (!fresh || fresh.status !== "PENDING") {
      throw new Error("scan.duplicateError");
    }

    const rule = await getRewardRule(tx, event.material);
    const { tokens, co2 } = computeReward(rule, event.estimatedKg);

    const updated = await tx.recyclingEvent.update({
      where: { id: event.id },
      data: { status: "VERIFIED", tokensAwarded: tokens, co2SavedKg: co2 },
    });

    await appendLedgerEntry(tx, {
      userId: user.id,
      direction: "CREDIT",
      reason: "RECYCLING_REWARD",
      amount: tokens,
      description: `Recycled ${event.estimatedKg}kg ${event.material.toLowerCase()} at ${event.station.name}`,
      recyclingEventId: updated.id,
    });

    const priorCount = await tx.recyclingEvent.count({
      where: { userId: user.id, status: "VERIFIED" },
    });
    if (priorCount === 1) {
      await grantAchievementOnce(tx, user.id, "FIRST_RECYCLE");
    }

    const totalPlastic = await tx.recyclingEvent.aggregate({
      where: { userId: user.id, status: "VERIFIED", material: "PLASTIC" },
      _sum: { estimatedKg: true },
    });
    if ((totalPlastic._sum.estimatedKg ?? 0) >= 10) {
      await grantAchievementOnce(tx, user.id, "PLASTIC_HERO");
    }

    await recalculateUserChallenges(tx, user.id);

    return updated;
    });
  } catch (err) {
    if (err.message === "scan.duplicateError") return fail("scan.duplicateError", 409);
    throw err;
  }

  return ok({ event: result });
});
