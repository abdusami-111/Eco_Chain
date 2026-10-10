import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendLedgerEntry, getUserBalance } from "@/lib/ledger";
import { ok, fail, withApiError } from "@/lib/api";

// Admin can flag a previously verified event as fraudulent after the fact.
// We never delete the original reward transaction (audit trail stays
// intact) — instead we record a compensating debit, capped at the user's
// current balance so the ledger can never go negative.
export const POST = withApiError(async (_req, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;

  const event = await prisma.recyclingEvent.findUnique({ where: { id } });
  if (!event) return fail("Event not found", 404);
  if (event.status === "REJECTED") return fail("Already rejected", 409);

  await prisma.$transaction(async (tx) => {
    if (event.status === "VERIFIED" && event.tokensAwarded > 0) {
      const balance = await getUserBalance(tx, event.userId);
      const clawback = Math.min(balance, event.tokensAwarded);
      if (clawback > 0) {
        await appendLedgerEntry(tx, {
          userId: event.userId,
          direction: "DEBIT",
          reason: "ADMIN_ADJUSTMENT",
          amount: clawback,
          description: `Admin reversal of flagged recycling event ${event.id}`,
        });
      }
    }

    await tx.recyclingEvent.update({ where: { id }, data: { status: "REJECTED" } });

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "REJECT_RECYCLING_EVENT",
        targetType: "RecyclingEvent",
        targetId: event.id,
        metadata: JSON.stringify({ tokensAwarded: event.tokensAwarded }),
      },
    });
  });

  return ok({ rejected: true });
});
