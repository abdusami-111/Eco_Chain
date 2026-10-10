import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async (req) => {
  await requireRole("ADMIN");
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const events = await prisma.recyclingEvent.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      station: { select: { id: true, name: true } },
    },
  });

  return ok({ events });
});
