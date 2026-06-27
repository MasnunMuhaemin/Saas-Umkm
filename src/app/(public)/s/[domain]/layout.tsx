import { notFound } from "next/navigation";
import { getStorefront } from "@/server/services/public/storefront.service";
import {
  StoreHeader,
  StoreFooter,
} from "./_components/storefront-chrome";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const data = await getStorefront(domain);
  if (!data) notFound();

  const { tenant } = data;
  return (
    <div style={{ ["--color-primary" as string]: tenant.primaryColor }}>
      <StoreHeader tenant={tenant} />
      <main>{children}</main>
      <StoreFooter tenant={tenant} />
    </div>
  );
}
