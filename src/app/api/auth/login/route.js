import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, fail, withApiError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST = withApiError(async (req) => {
  const body = schema.parse(await req.json());
  const email = body.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return fail("auth.error.invalid", 401);

  const validPassword = await verifyPassword(body.password, user.passwordHash);
  if (!validPassword) return fail("auth.error.invalid", 401);

  await createSession(user.id);

  const { passwordHash: _omit, ...safeUser } = user;
  return ok({ user: safeUser });
});
