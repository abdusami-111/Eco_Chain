import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { classifyWaste, AI_MODE } from "@/lib/classifier";
import { MATERIALS } from "@/lib/constants";
import { ok, withApiError } from "@/lib/api";

const schema = z.object({
  material: z.enum(MATERIALS),
});

// Pure classification preview — does NOT create a recycling event or award
// any tokens. An image upload alone (or a finished animation) never pays
// out; only the verify step below does, after a station check.
export const POST = withApiError(async (req) => {
  await requireUser();
  const { material } = schema.parse(await req.json());
  const result = classifyWaste(material);
  return ok({ ...result, globalMode: AI_MODE });
});
