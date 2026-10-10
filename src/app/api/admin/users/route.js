import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async () => {
  await requireRole("ADMIN");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      district: true,
      isActive: true,
      createdAt: true,
    },
  });
  return ok({ users });
});
