import { getProducts } from "./actions";
import { getCategories } from "../categories/actions";
import ProductsManager from "@/components/admin/ProductsManager";

export default async function AdminProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your store inventory.</p>
        </div>
      </div>

      <ProductsManager initialProducts={products} categories={categories} />
    </div>
  );
}
