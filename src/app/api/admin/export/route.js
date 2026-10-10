import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withApiError } from "@/lib/api";

function toCsv(rows, columns) {
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const value = row[col] ?? "";
        const str = String(value).replace(/"/g, '""');
        return /[",\n]/.test(str) ? `"${str}"` : str;
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

export const GET = withApiError(async (req) => {
  await requireRole("ADMIN");
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "transactions";

  let csv;
  if (type === "transactions") {
    const rows = await prisma.tokenTransaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    });
    csv = toCsv(
      rows.map((r) => ({
        id: r.id,
        userEmail: r.user.email,
        userName: r.user.name,
        direction: r.direction,
        reason: r.reason,
        amount: r.amount,
        balanceAfter: r.balanceAfter,
        description: r.description,
        integrityHash: r.integrityHash,
        createdAt: r.createdAt.toISOString(),
      })),
      [
        "id",
        "userEmail",
        "userName",
        "direction",
        "reason",
        "amount",
        "balanceAfter",
        "description",
        "integrityHash",
        "createdAt",
      ]
    );
  } else if (type === "events") {
    const rows = await prisma.recyclingEvent.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } }, station: { select: { name: true } } },
    });
    csv = toCsv(
      rows.map((r) => ({
        id: r.id,
        userEmail: r.user.email,
        station: r.station.name,
        material: r.material,
        estimatedKg: r.estimatedKg,
        status: r.status,
        tokensAwarded: r.tokensAwarded,
        co2SavedKg: r.co2SavedKg,
        createdAt: r.createdAt.toISOString(),
      })),
      ["id", "userEmail", "station", "material", "estimatedKg", "status", "tokensAwarded", "co2SavedKg", "createdAt"]
    );
  } else {
    return new Response("Unknown export type", { status: 400 });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="ecochain-${type}.csv"`,
    },
  });
});
