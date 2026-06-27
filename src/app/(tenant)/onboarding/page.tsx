import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getServerTrpc } from "@/lib/trpc/server";
import { OnboardingWizard } from "./_components/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (session?.user?.role !== "MERCHANT") redirect("/login");

  const api = await getServerTrpc();
  const status = await api.onboarding.status();
  if (status.onboarded) redirect("/dashboard");

  return <OnboardingWizard initial={status} />;
}
