import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  district: z.string().max(80).optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export const PATCH = withApiError(async (req) => {
  const user = await requireUser();
  const body = schema.parse(await req.json());

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.district !== undefined ? { district: body.district.trim() || null } : {}),
      ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl || null } : {}),
    },
  });

  const { passwordHash, ...safeUser } = updated;
  return ok({ user: safeUser });
});
