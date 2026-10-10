import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MATERIALS } from "@/lib/constants";
import { ok, withApiError } from "@/lib/api";

const schema = z
  .object({
    name: z.string().min(2),
    address: z.string().min(2),
    district: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
    acceptedMaterials: z.array(z.enum(MATERIALS)).min(1),
    openingHours: z.string().min(1),
    capacityPercent: z.number().min(0).max(100),
    isActive: z.boolean(),
  })
  .partial();

export const PATCH = withApiError(async (req, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const body = schema.parse(await req.json());

  const station = await prisma.station.update({
    where: { id },
    data: {
      ...body,
      ...(body.acceptedMaterials ? { acceptedMaterials: JSON.stringify(body.acceptedMaterials) } : {}),
    },
  });

  return ok({ station: { ...station, acceptedMaterials: JSON.parse(station.acceptedMaterials) } });
});

export const DELETE = withApiError(async (_req, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.station.update({ where: { id }, data: { isActive: false } });
  return ok({ deactivated: true });
});
