import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { getServerTrpc } from "@/lib/trpc/server";
import { ProductForm } from "../../_components/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = await getServerTrpc();

  try {
    const [product, categories] = await Promise.all([
      api.product.byId({ id }),
      api.category.list(),
    ]);
    return <ProductForm product={product} categories={categories} />;
  } catch (e) {
    if (e instanceof TRPCError || e instanceof Error) notFound();
    throw e;
  }
}
