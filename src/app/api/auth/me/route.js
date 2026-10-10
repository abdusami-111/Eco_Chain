import { getCurrentUser } from "@/lib/auth";
import { ok, withApiError } from "@/lib/api";
import { getUserBalance } from "@/lib/ledger";
import { prisma } from "@/lib/prisma";

export const GET = withApiError(async () => {
  const user = await getCurrentUser();
  if (!user) return ok({ user: null });
  const balance = await getUserBalance(prisma, user.id);
  return ok({ user: { ...user, balance } });
});
