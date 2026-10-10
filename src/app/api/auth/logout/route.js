import { destroySession } from "@/lib/auth";
import { ok, withApiError } from "@/lib/api";

export const POST = withApiError(async () => {
  await destroySession();
  return ok({ loggedOut: true });
});
