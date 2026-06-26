import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke dashboard MayWeb untuk mengelola toko online Anda.",
};

export default function LoginPage() {
  return <LoginForm />;
}
