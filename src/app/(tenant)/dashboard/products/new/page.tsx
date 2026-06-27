import { getServerTrpc } from "@/lib/trpc/server";
import { ProductForm } from "../_components/product-form";

export default async function NewProductPage() {
  const api = await getServerTrpc();
  const categories = await api.category.list();
  return <ProductForm categories={categories} />;
}
