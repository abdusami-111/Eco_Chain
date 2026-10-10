import { prisma } from "@/lib/prisma";
import { ok, withApiError } from "@/lib/api";

export const GET = withApiError(async () => {
  const stations = await prisma.station.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const data = stations.map((s) => ({
    ...s,
    acceptedMaterials: JSON.parse(s.acceptedMaterials),
  }));

  return ok({ stations: data });
});
