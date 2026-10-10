import { randomBytes } from "crypto";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MATERIALS } from "@/lib/constants";
import { ok, fail, withApiError } from "@/lib/api";

const schema = z.object({
  material: z.enum(MATERIALS),
  estimatedKg: z.number().min(0.05).max(25),
  stationId: z.string().min(1),
  aiConfidence: z.number().min(0).max(100).optional(),
});

// Step 1 of the verification flow: the user picked a material and a
// station. We open a PENDING event with a server-generated nonce. No
// tokens are awarded yet — that only happens once the station's QR code
// is confirmed in /api/scan/verify.
export const POST = withApiError(async (req) => {
  const user = await requireUser();
  const body = schema.parse(await req.json());

  const station = await prisma.station.findUnique({ where: { id: body.stationId } });
  if (!station || !station.isActive) return fail("Station not found", 404);

  const accepted = JSON.parse(station.acceptedMaterials);
  if (!accepted.includes(body.material)) {
    return fail("This station does not accept this material", 400);
  }

  const nonce = randomBytes(6).toString("hex").toUpperCase();

  const event = await prisma.recyclingEvent.create({
    data: {
      userId: user.id,
      stationId: station.id,
      material: body.material,
      estimatedKg: body.estimatedKg,
      aiConfidence: body.aiConfidence ?? null,
      aiMode: "demo",
      status: "PENDING",
      verificationCode: nonce,
    },
  });

  return ok({
    eventId: event.id,
    expectedCode: station.qrCode, // demo-only: lets the UI show what to "scan"
    expiresInSeconds: 600,
  });
});
