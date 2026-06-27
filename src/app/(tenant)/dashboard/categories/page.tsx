import { getServerTrpc } from "@/lib/trpc/server";
import { CategoryManager } from "./_components/category-manager";

export default async function CategoriesPage() {
  const api = await getServerTrpc();
  const initial = await api.category.all();
  return <CategoryManager initial={initial} />;
}
