import { getServerTrpc } from "@/lib/trpc/server";
import { ProductTable } from "./_components/product-table";

export default async function ProductsPage() {
  const api = await getServerTrpc();
  const [initialData, categories] = await Promise.all([
    api.product.list({ page: 1 }),
    api.category.list(),
  ]);

  return <ProductTable initialData={initialData} categories={categories} />;
}
