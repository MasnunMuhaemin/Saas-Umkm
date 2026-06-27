import { RegisterForm } from "./_components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const defaultPlan = plan === "plus" ? "plus" : "basic";
  return <RegisterForm defaultPlan={defaultPlan} />;
}
