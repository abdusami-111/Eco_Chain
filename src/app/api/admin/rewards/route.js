import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

const schema = z.object({
  category: z.string().min(1),
  partnerName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url(),
  tokenCost: z.number().int().positive(),
  stockQuantity: z.number().int().nonnegative().nullable().optional(),
  conditions: z.string().optional(),
});

export const GET = withApiError(async () => {
  await requireRole("ADMIN");
  const rewards = await prisma.reward.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ rewards });
});

export const POST = withApiError(async (req) => {
  await requireRole("ADMIN");
  const body = schema.parse(await req.json());
  const reward = await prisma.reward.create({ data: { ...body, isDemo: true } });
  return ok({ reward });
});
