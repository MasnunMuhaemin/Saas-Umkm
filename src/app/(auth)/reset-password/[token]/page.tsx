import type { Metadata } from "next";
import { ResetForm } from "./_components/reset-form";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ResetForm token={token} />;
}
