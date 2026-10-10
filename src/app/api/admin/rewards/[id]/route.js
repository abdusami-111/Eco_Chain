import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

const schema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.string().url(),
    tokenCost: z.number().int().positive(),
    stockQuantity: z.number().int().nonnegative().nullable(),
    isActive: z.boolean(),
  })
  .partial();

export const PATCH = withApiError(async (req, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const body = schema.parse(await req.json());
  const reward = await prisma.reward.update({ where: { id }, data: body });
  return ok({ reward });
});

export const DELETE = withApiError(async (_req, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.reward.update({ where: { id }, data: { isActive: false } });
  return ok({ deactivated: true });
});
