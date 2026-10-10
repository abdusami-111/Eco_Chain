import { randomBytes } from "crypto";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendLedgerEntry } from "@/lib/ledger";
import { getUserBalance } from "@/lib/ledger";
import { ok, fail, withApiError } from "@/lib/api";

function couponCode() {
  return "ECO-" + randomBytes(4).toString("hex").toUpperCase();
}

// The server is the sole authority on balance and stock. The client never
// sends a token amount — only which reward it wants to redeem.
export const POST = withApiError(async (req, { params }) => {
  const user = await requireUser();
  const { id: rewardId } = await params;

  let redemption;
  try {
    redemption = await prisma.$transaction(async (tx) => {
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });
      if (!reward || !reward.isActive) throw new Error("not_found");
      if (reward.expiresAt && reward.expiresAt < new Date()) throw new Error("expired");
      if (reward.stockQuantity !== null && reward.stockQuantity <= 0) {
        throw new Error("out_of_stock");
      }

      const balance = await getUserBalance(tx, user.id);
      if (balance < reward.tokenCost) throw new Error("insufficient_balance");

      if (reward.stockQuantity !== null) {
        await tx.reward.update({
          where: { id: reward.id },
          data: { stockQuantity: { decrement: 1 } },
        });
      }

      const created = await tx.redemption.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          couponCode: couponCode(),
          tokensSpent: reward.tokenCost,
        },
      });

      await appendLedgerEntry(tx, {
        userId: user.id,
        direction: "DEBIT",
        reason: "REWARD_REDEMPTION",
        amount: reward.tokenCost,
        description: `Redeemed: ${reward.title} (${reward.partnerName})`,
        redemptionId: created.id,
      });

      return tx.redemption.findUnique({
        where: { id: created.id },
        include: { reward: true },
      });
    });
  } catch (err) {
    const map = {
      not_found: ["Reward not found", 404],
      expired: ["This reward has expired", 410],
      out_of_stock: ["This reward is out of stock", 409],
      insufficient_balance: ["rewards.insufficientTokens", 402],
    };
    const [message, status] = map[err.message] || [err.message, 500];
    return fail(message, status);
  }

  return ok({ redemption });
});
