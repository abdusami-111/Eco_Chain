import { createHash } from "crypto";

// Appends one entry to a user's token ledger inside an existing Prisma
// transaction (`tx`). This is the ONLY place balances change — the server is
// always the authority, never the client. Each entry is chained to the
// previous one via a SHA-256 hash so the ledger is tamper-evident: altering
// or deleting a past row breaks every hash after it. This is a real
// integrity check, not a blockchain — no network, no wallet, no claim of
// decentralization.
export async function appendLedgerEntry(tx, {
  userId,
  direction, // "CREDIT" | "DEBIT"
  reason,
  amount,
  description,
  recyclingEventId = null,
  redemptionId = null,
}) {
  if (amount <= 0) throw new Error("Ledger amount must be positive");

  const last = await tx.tokenTransaction.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const currentBalance = last?.balanceAfter ?? 0;
  const balanceAfter =
    direction === "CREDIT" ? currentBalance + amount : currentBalance - amount;

  if (balanceAfter < 0) {
    throw new Error("Insufficient balance");
  }

  const prevHash = last?.integrityHash ?? "GENESIS";
  const payload = JSON.stringify({
    userId,
    direction,
    reason,
    amount,
    balanceAfter,
    prevHash,
    ts: Date.now(),
  });
  const integrityHash = createHash("sha256").update(payload).digest("hex");

  return tx.tokenTransaction.create({
    data: {
      userId,
      direction,
      reason,
      amount,
      balanceAfter,
      description,
      recyclingEventId,
      redemptionId,
      prevHash,
      integrityHash,
    },
  });
}

export async function getUserBalance(db, userId) {
  const last = await db.tokenTransaction.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return last?.balanceAfter ?? 0;
}
