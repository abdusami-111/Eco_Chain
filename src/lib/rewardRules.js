// Reward amounts are never trusted from the client. They are always
// recomputed server-side from the admin-configurable RewardRule table.
export async function getRewardRule(db, material) {
  const rule = await db.rewardRule.findUnique({ where: { material } });
  if (!rule) throw new Error(`No reward rule configured for ${material}`);
  return rule;
}

export function computeReward(rule, estimatedKg) {
  const tokens = Math.max(1, Math.round(estimatedKg * rule.tokensPerKg));
  const co2 = Math.round(estimatedKg * rule.co2PerKg * 100) / 100;
  return { tokens, co2 };
}
