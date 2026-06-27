import type { Metadata } from "next";
import { ForgotForm } from "./_components/forgot-form";

export const metadata: Metadata = { title: "Lupa Password" };

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
