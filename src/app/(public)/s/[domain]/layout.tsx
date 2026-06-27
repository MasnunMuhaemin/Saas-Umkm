import { notFound } from "next/navigation";
import { getStorefront } from "@/server/services/public/storefront.service";
import {
  StoreHeader,
  StoreFooter,
} from "./_components/storefront-chrome";
import { Tracker } from "./_components/tracker";

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
      <Tracker domain={domain} />
      <StoreHeader tenant={tenant} />
      <main>{children}</main>
      <StoreFooter tenant={tenant} />
    </div>
  );
}
