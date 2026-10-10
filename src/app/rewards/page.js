import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import RewardsClient from "./RewardsClient";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <RewardsClient />
    </AppShell>
  );
}
