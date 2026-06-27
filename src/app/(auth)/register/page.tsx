import { getServerTrpc } from "@/lib/trpc/server";
import { RegisterForm } from "./_components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const defaultPlan = plan === "plus" ? "plus" : "basic";

  const api = await getServerTrpc();
  const plans = await api.plans();
  const priceBySlug: Record<string, number> = Object.fromEntries(
    plans.map((p) => [p.slug, p.price]),
  );

  return <RegisterForm defaultPlan={defaultPlan} priceBySlug={priceBySlug} />;
}
