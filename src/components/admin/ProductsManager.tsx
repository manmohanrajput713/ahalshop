"use client";

import { useState, useMemo } from "react";
import ProductForm from "./ProductForm";
import { Trash2, Plus, Edit, Loader2, Package, X, FolderPlus, Tag } from "lucide-react";
import Image from "next/image";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";
import { addCategory, deleteCategory } from "@/app/admin/(dashboard)/categories/actions";

export default function ProductsManager({ initialProducts, categories = [] }: { initialProducts: any[], categories?: any[] }) {
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category management state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Merge DB categories with unique categories from existing products
  const allCategories = useMemo(() => {
    const dbCatNames = new Set(categories.map((c: any) => c.name));
    const productCatNames = new Set(initialProducts.map((p: any) => p.category).filter(Boolean));
    
    // Start with DB categories (they have IDs for deletion)
    const merged: any[] = [...categories];
    
    // Add product-derived categories that aren't already in DB
    productCatNames.forEach((name: string) => {
      if (!dbCatNames.has(name)) {
        merged.push({ id: `product-${name}`, name, fromProducts: true });
      }
    });
    
    // Sort alphabetically
    merged.sort((a, b) => a.name.localeCompare(b.name));
    return merged;
  }, [categories, initialProducts]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    setCategoryError("");
    try {
      const formData = new FormData();
      formData.set("name", newCategoryName.trim());
      const result = await addCategory(formData);
      if (result?.error) {
        setCategoryError(result.error);
      } else {
        setNewCategoryName("");
        setShowCategoryForm(false);
      }
    } catch (err) {
      setCategoryError("Failed to add category.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (cat.fromProducts) return; // Can't delete product-derived categories
    setIsDeletingCategory(true);
    try {
      await deleteCategory(cat.id);
    } finally {
      setIsDeletingCategory(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      {/* Categories Management Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Categories</h2>
              <p className="text-xs text-muted-foreground">{allCategories.length} categories</p>
            </div>
          </div>
          <button
            onClick={() => { setShowCategoryForm(!showCategoryForm); setCategoryError(""); }}
            className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs tracking-wider uppercase font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <FolderPlus size={14} />
            {showCategoryForm ? "Cancel" : "Add Category"}
          </button>
        </div>

        {/* Add Category Form */}
        {showCategoryForm && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3 max-w-md">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Face Serum"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                disabled={isAddingCategory || !newCategoryName.trim()}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isAddingCategory ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
            </div>
            {categoryError && (
              <p className="text-xs text-red-500 mt-2">{categoryError}</p>
            )}
          </div>
        )}

        {/* Categories List */}
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat: any) => (
              <div
                key={cat.id}
                className={`group inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  cat.fromProducts
                    ? "bg-muted/50 border-border text-muted-foreground"
                    : "bg-primary/5 border-primary/20 text-foreground"
                }`}
              >
                <span>{cat.name}</span>
                {!cat.fromProducts && (
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all ml-0.5"
                    title="Delete category"
                  >
                    <X size={12} />
                  </button>
                )}
                {cat.fromProducts && (
                  <span className="text-[9px] text-muted-foreground/60 ml-0.5" title="This category exists because products use it">(from products)</span>
                )}
              </div>
            ))}
            {allCategories.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">No categories yet. Add one to get started.</p>
            )}
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Products ({initialProducts.length})</h2>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs tracking-wider uppercase font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Badge</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {initialProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-accent/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        <Image 
                          src={product.img} 
                          alt={product.alt || product.name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.price}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const stock = product.stock ?? 0;
                      if (stock === 0) {
                        return (
                          <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Out of Stock
                          </span>
                        );
                      } else if (stock <= 5) {
                        return (
                          <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 text-xs px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            {stock} left
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 text-xs px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {stock}
                          </span>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    {product.badge ? (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-muted-foreground hover:text-foreground p-2 rounded hover:bg-accent transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setProductToDelete(product)}
                        className="text-destructive hover:text-destructive/80 p-2 rounded hover:bg-destructive/10 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No products found. Add one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit / Add Product Modal ─── */}
      {(editingProduct || showAddForm) && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div 
            className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                {editingProduct ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Edit className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  {editingProduct && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Editing: {editingProduct.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setEditingProduct(null); setShowAddForm(false); }}
                className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <ProductForm
                key={editingProduct ? editingProduct.id : "new"}
                initialData={editingProduct}
                categories={allCategories}
                onSuccess={handleSuccess}
                onCancel={() => { setEditingProduct(null); setShowAddForm(false); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Product Confirmation Modal ─── */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 
              className="text-xl font-normal text-foreground mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              <Trash2 className="text-destructive" size={20} />
              Delete Product
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-medium text-foreground">&quot;{productToDelete.name}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium text-foreground hover:bg-muted border border-border rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteProduct(productToDelete.id);
                  } finally {
                    setIsDeleting(false);
                    setProductToDelete(null);
                  }
                }}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Category Confirmation Modal ─── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 
              className="text-xl font-normal text-foreground mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              <Trash2 className="text-destructive" size={20} />
              Delete Category
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-medium text-foreground">&quot;{categoryToDelete.name}&quot;</span>? Products using this category won&apos;t be affected.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeletingCategory}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium text-foreground hover:bg-muted border border-border rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(categoryToDelete)}
                disabled={isDeletingCategory}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeletingCategory ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
