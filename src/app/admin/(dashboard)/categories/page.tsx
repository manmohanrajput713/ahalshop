import { getCategories, addCategory, deleteCategory } from "./actions";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import FormButton from "./FormButton";

export const metadata = {
  title: "Categories - Admin Dashboard",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">Categories</h1>
        <p className="text-sm text-muted-foreground">Manage product categories for your store.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Add New Category</h3>
        <form action={addCategory} className="flex gap-4 items-start max-w-md">
          <div className="flex-1">
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Face Serum"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
          <FormButton />
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <FolderOpen size={32} className="opacity-50" />
            <p className="text-sm">No categories found.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category: any) => (
                <tr key={category.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async () => {
                      "use server";
                      await deleteCategory(category.id);
                    }}>
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-2"
                        title="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
