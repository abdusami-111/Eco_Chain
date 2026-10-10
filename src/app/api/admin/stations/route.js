import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MATERIALS } from "@/lib/constants";
import { ok, withApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  district: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  acceptedMaterials: z.array(z.enum(MATERIALS)).min(1),
  openingHours: z.string().min(1),
  qrCode: z.string().min(3),
});

export const GET = withApiError(async () => {
  await requireRole("ADMIN");
  const stations = await prisma.station.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ stations: stations.map((s) => ({ ...s, acceptedMaterials: JSON.parse(s.acceptedMaterials) })) });
});

export const POST = withApiError(async (req) => {
  await requireRole("ADMIN");
  const body = schema.parse(await req.json());
  const station = await prisma.station.create({
    data: { ...body, acceptedMaterials: JSON.stringify(body.acceptedMaterials), isDemoLocation: true },
  });
  return ok({ station });
});
