import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApiError } from "@/lib/api";

const schema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["USER", "PARTNER", "ADMIN"]).optional(),
});

export const PATCH = withApiError(async (req, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  if (id === admin.id) return fail("Cannot modify your own account here", 400);

  const body = schema.parse(await req.json());
  const user = await prisma.user.update({ where: { id }, data: body });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "UPDATE_USER",
      targetType: "User",
      targetId: id,
      metadata: JSON.stringify(body),
    },
  });

  const { passwordHash, ...safeUser } = user;
  return ok({ user: safeUser });
});
