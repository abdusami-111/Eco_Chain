import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { ok, fail, withApiError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80),
  district: z.string().max(80).optional(),
});

export const POST = withApiError(async (req) => {
  const body = schema.parse(await req.json());
  const email = body.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail("auth.error.exists", 409);

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: body.name.trim(),
      district: body.district?.trim() || null,
    },
  });

  await createSession(user.id);

  const { passwordHash: _omit, ...safeUser } = user;
  return ok({ user: safeUser });
});
