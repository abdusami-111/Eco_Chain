import { appendLedgerEntry } from "@/lib/ledger";

async function userProgressForChallenge(db, userId, challenge) {
  const where = {
    userId,
    status: "VERIFIED",
    createdAt: { gte: challenge.startDate, lte: challenge.endDate },
  };

  if (challenge.goalType === "weight_kg") {
    const agg = await db.recyclingEvent.aggregate({ where, _sum: { estimatedKg: true } });
    return agg._sum.estimatedKg ?? 0;
  }
  if (challenge.goalType === "events_count") {
    return db.recyclingEvent.count({ where });
  }
  if (challenge.goalType === "stations_visited") {
    const events = await db.recyclingEvent.findMany({ where, select: { stationId: true } });
    return new Set(events.map((e) => e.stationId)).size;
  }
  return 0;
}

async function communityProgressForChallenge(db, challenge) {
  const where = {
    status: "VERIFIED",
    createdAt: { gte: challenge.startDate, lte: challenge.endDate },
  };
  if (challenge.goalType === "weight_kg") {
    const agg = await db.recyclingEvent.aggregate({ where, _sum: { estimatedKg: true } });
    return agg._sum.estimatedKg ?? 0;
  }
  return db.recyclingEvent.count({ where });
}

// Recomputes progress for every challenge the user has joined and awards
// completion bonuses exactly once. Called server-side after a verified
// recycling event — never trusts client-reported progress.
export async function recalculateUserChallenges(tx, userId) {
  const now = new Date();
  const participants = await tx.challengeParticipant.findMany({
    where: { userId, challenge: { isActive: true, startDate: { lte: now }, endDate: { gte: now } } },
    include: { challenge: true },
  });

  for (const p of participants) {
    const progress = p.challenge.isCommunity
      ? await communityProgressForChallenge(tx, p.challenge)
      : await userProgressForChallenge(tx, userId, p.challenge);

    const isCompleted = progress >= p.challenge.goalValue;
    const data = { progress };

    if (isCompleted && !p.rewardedAt) {
      data.isCompleted = true;
      data.completedAt = p.completedAt ?? now;
      data.rewardedAt = now;
      await appendLedgerEntry(tx, {
        userId,
        direction: "CREDIT",
        reason: "CHALLENGE_REWARD",
        amount: p.challenge.rewardTokens,
        description: `Challenge completed: ${p.challenge.title}`,
      });
    }

    await tx.challengeParticipant.update({ where: { id: p.id }, data });
  }
}

export async function grantAchievementOnce(tx, userId, code) {
  const achievement = await tx.achievement.findUnique({ where: { code } });
  if (!achievement) return;
  await tx.userAchievement.upsert({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
    update: {},
    create: { userId, achievementId: achievement.id },
  });
}
