import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { requireRole } from "@/lib/auth";
import { ok, withApiError } from "@/lib/api";

const execFileAsync = promisify(execFile);

// Restores all seed data (demo users, stations, rewards, challenges, and a
// sample ledger history) without any manual database edits. Admin-only;
// runs a fixed script path with no user-supplied arguments.
export const POST = withApiError(async () => {
  await requireRole("ADMIN");
  const scriptPath = path.join(process.cwd(), "prisma", "seed.js");
  await execFileAsync(process.execPath, [scriptPath]);
  return ok({ reset: true });
});
